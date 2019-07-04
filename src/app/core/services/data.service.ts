import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import {
    SampleData,
    SampleSet,
    MarshalledData,
    SampleSubmission,
    AnnotatedSampleDataEntry,
    SampleProperty,
    SampleSetMetaData,
    ExcelFile
} from '../../samples/model/sample-management.model';
import {
    ActivationResponseDTO,
    SystemInformationResponseDTO,
    FAQResponseDTO,
    TokenRefreshResponseDTO,
    MarshalledDataResponseDTO,
    TokenizedUserDTO,
    RegistrationRequestResponseDTO,
    PasswordResetRequestResponseDTO,
    InstituteCollectionDTO
} from '../model/response.model';
import { TokenizedUser, Credentials, RegistrationDetails } from '../../user/model/user.model';
import {
    ResetRequestDTO,
    NewPasswordRequestDTO,
    RegistrationDetailsDTO,
    SampleSubmissionDTO
} from '../model/request.model';
import { ClientError } from '../model/client-error';
import {
    AnnotatedSampleDTO,
    AnnotatedSampleDataEntryDTO,
    AnnotatedSampleSetDTO,
    AnnotatedOrderDTO,
    SampleSetMetaDTO,
    SampleSetDTO,
    SampleDataEntryDTO
} from '../model/shared-dto.model';
import { LogService } from './log.service';
import { InstitutionDTO } from '../../user/model/institution.model';
import { Urgency } from '../../samples/model/sample.enums';
import { SamplesMainData } from '../../samples/state/samples.state';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private API_VERSION = 'v1';
    private USER = 'users';
    private SAMPLE = 'samples';
    private TOKEN = 'tokens';
    private INSTITUTE = 'institutes';
    private URL = {
        submit: [this.API_VERSION, this.SAMPLE, 'submitted'].join('/'),
        validate: [this.API_VERSION, this.SAMPLE, 'validated'].join('/'),
        marshal: [this.API_VERSION, this.SAMPLE].join('/'),
        unmarshal: [this.API_VERSION, this.SAMPLE].join('/'),
        institutions: [this.API_VERSION, this.INSTITUTE].join('/'),
        login: [this.API_VERSION, this.USER, 'login'].join('/'),
        register: [this.API_VERSION, this.USER, 'registration'].join('/'),
        resetPasswordRequest: [this.API_VERSION, this.USER, 'reset-password-request'].join('/'),
        resetPassword: [this.API_VERSION, this.USER, 'reset-password'].join('/'),
        verifyEmail: [this.API_VERSION, this.USER, 'verification'].join('/'),
        activateAccount: [this.API_VERSION, this.USER, 'activation'].join('/'),
        refresh: [this.API_VERSION, this.TOKEN].join('/'),
        systemInfo: [this.API_VERSION, 'info'].join('/'),
        faq: './assets/faq.json'
    };

    constructor(private httpClient: HttpClient, private logger: LogService) {
    }

    setCurrentUser(user: TokenizedUser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    getFAQs(): Observable<FAQResponseDTO> {
        return this.httpClient.get<FAQResponseDTO>(this.URL.faq);
    }

    getSystemInfo(): Observable<SystemInformationResponseDTO> {
        return this.httpClient.get<SystemInformationResponseDTO>(this.URL.systemInfo);
    }

    logout() {
        localStorage.removeItem('currentUser');
        return new Observable<void>().toPromise();
    }

    login(credentials: Credentials): Observable<TokenizedUser> {
        return this.httpClient.post<TokenizedUserDTO>(this.URL.login, credentials).pipe(
            map((dto: TokenizedUserDTO) => {
                return dto;
            })
        );
    }

    sendSampleSheet(sendableFormData: SampleSubmission) {
        const requestDTO: SampleSubmissionDTO = {
            order: this.fromSampleSetToDTO(sendableFormData.order),
            comment: sendableFormData.comment
        };
        return this.httpClient.post<AnnotatedSampleDTO[]>(this.URL.submit, requestDTO).pipe(
            map((dtoArray: AnnotatedSampleDTO[]) => dtoArray.map(dto => this.fromAnnotatedDTOToSampleData(dto)))
        );
    }

    validateSampleData(requestData: SamplesMainData): Observable<SampleData[]> {
        const requestDTO: AnnotatedOrderDTO = this.fromSamplesMainDataToAnnotatedOrderDTO(requestData);
        return this.httpClient.put<AnnotatedOrderDTO>(this.URL.validate, requestDTO).pipe(
            map((dto: AnnotatedOrderDTO) => dto.order.samples.map(container => this.fromAnnotatedDTOToSampleData(container.sample)))
        );
    }

    unmarshalExcel(requestData: ExcelFile): Observable<SampleSet> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        const formData: FormData = new FormData();
        formData.append('file', requestData.file, requestData.file.name);
        return this.httpClient.put<AnnotatedOrderDTO>(this.URL.unmarshal, formData, httpOptions).pipe(
            map((dto: AnnotatedOrderDTO) => this.fromDTOToAnnotatedSampleSet(dto.order)),
            catchError((error) => {
                throw new ClientError(`Failed to read excel file. error=${error}`);
            }));
    }

    marshalJSON(requestData: SamplesMainData): Observable<MarshalledData> {
        const requestBody: AnnotatedOrderDTO = this.fromSamplesMainDataToAnnotatedOrderDTO(requestData);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'multipart/form-data'
            })
        };
        return this.httpClient.put<MarshalledDataResponseDTO>(this.URL.marshal, requestBody, httpOptions).pipe(
            map((dto: MarshalledDataResponseDTO) => this.fromMarshalledDataResponseDTOToMarshalledData(dto)));
    }

    getAllInstitutions(): Observable<InstitutionDTO[]> {
        return this.httpClient.get<InstituteCollectionDTO>(this.URL.institutions).pipe(
            map((dto: InstituteCollectionDTO) => {
                return dto.institutes;
            }));
    }

    registrationRequest(registrationDetails: RegistrationDetails): Observable<RegistrationRequestResponseDTO> {
        const registrationDetailsDTO: RegistrationDetailsDTO = { ...registrationDetails };
        return this.httpClient.post<RegistrationRequestResponseDTO>(this.URL.register, registrationDetailsDTO);
    }

    resetPasswordRequest(email: string): Observable<PasswordResetRequestResponseDTO> {
        const resetRequest: ResetRequestDTO = { email };
        return this.httpClient.put<PasswordResetRequestResponseDTO>(this.URL.resetPasswordRequest, resetRequest);
    }

    resetPassword(password: string, token: string) {
        const newPassword: NewPasswordRequestDTO = { password };
        return this.httpClient.patch([this.URL.resetPassword, token].join('/'), newPassword);
    }

    verifyEmail(token: string): Observable<boolean> {
        return this.httpClient.patch<ActivationResponseDTO>([this.URL.verifyEmail, token].join('/'), null).pipe(
            map(r => r.activation)
        );
    }

    activateAccount(adminToken: string): Observable<ActivationResponseDTO> {
        return this.httpClient.patch<ActivationResponseDTO>([this.URL.activateAccount, adminToken].join('/'), null);
    }

    refreshToken(): Observable<TokenRefreshResponseDTO> {
        return this.httpClient.post<TokenRefreshResponseDTO>(this.URL.refresh, null);
    }

    private fromMarshalledDataResponseDTOToMarshalledData(dto: MarshalledDataResponseDTO): MarshalledData {
        return {
            binaryData: dto.data,
            mimeType: dto.type,
            fileName: dto.fileName
        };
    }

    private fromDTOToAnnotatedSampleSet(dto: AnnotatedSampleSetDTO): SampleSet {
        const annotatedSampleSet: SampleSet = {
            meta: this.fromDTOToSampleSetMetaData(dto.meta),
            samples: dto.samples.map(sampleContainerDTO => {
                return this.fromAnnotatedDTOToSampleData(sampleContainerDTO.sample);
            })
        };
        return annotatedSampleSet;
    }

    private fromSampleSetToAnnotatedDTO(sampleSet: SampleSet): AnnotatedSampleSetDTO {
        const dto: AnnotatedSampleSetDTO = {
            meta: this.fromSampleSetMetaDataToDTO(sampleSet.meta),
            samples: sampleSet.samples.map(sample => ({ sample: sample }))
        };
        return dto;
    }

    private fromSampleSetToDTO(sampleSet: SampleSet): SampleSetDTO {
        const dto: SampleSetDTO = {
            meta: this.fromSampleSetMetaDataToDTO(sampleSet.meta),
            samples: sampleSet.samples.map(sample => ({ sample: this.fromSampleDataToDTO(sample) }))
        };
        return dto;
    }

    private fromSampleDataToDTO(sampleData: SampleData) {
        const dto: Record<SampleProperty, SampleDataEntryDTO> = {};
        Object.keys(sampleData).forEach(prop => dto[prop] = {
            value: sampleData[prop].value,
            oldValue: sampleData[prop].oldValue
        });
        return dto;
    }

    private fromDTOToSampleSetMetaData(dto: SampleSetMetaDTO): SampleSetMetaData {
        return {
            nrl: dto.nrl,
            analysis: dto.analysis,
            sender: dto.sender,
            urgency: this.fromStringToEnum(dto.urgency),
            fileName: dto.fileName ? dto.fileName : ''
        };
    }

    private fromSampleSetMetaDataToDTO(meta: SampleSetMetaData): SampleSetMetaDTO {
        return {
            nrl: meta.nrl,
            analysis: meta.analysis,
            sender: meta.sender,
            urgency: meta.urgency
        };
    }

    private fromStringToEnum(str: string): Urgency {
        switch (str.trim().toLowerCase()) {
            case 'eilt':
                return Urgency.URGENT;
            case 'normal':
            default:
                return Urgency.NORMAL;
        }
    }
    private fromSamplesMainDataToAnnotatedOrderDTO({ meta, formData }: SamplesMainData): AnnotatedOrderDTO {
        const dto: AnnotatedSampleSetDTO = this.fromSampleSetToAnnotatedDTO({
            meta,
            samples: formData
        });
        return { order: dto };
    }
    private fromSampleSetToAnnotatedOrderDTO(sampleSet: SampleSet): AnnotatedOrderDTO {
        const dto: AnnotatedSampleSetDTO = this.fromSampleSetToAnnotatedDTO(sampleSet);
        return { order: dto };
    }

    private fromAnnotatedDTOToSampleData(dto: AnnotatedSampleDTO): SampleData {
        const annotatedSampleData: Record<SampleProperty, AnnotatedSampleDataEntry> = {};
        Object.keys(dto).forEach(prop => annotatedSampleData[prop] = this.fromDTOToAnnotatedSampleDataEntry(dto[prop]));
        return annotatedSampleData as SampleData;
    }

    private fromDTOToAnnotatedSampleDataEntry(dto: AnnotatedSampleDataEntryDTO): AnnotatedSampleDataEntry {
        try {
            const annotatedSampleDataEntry: AnnotatedSampleDataEntry = {
                value: dto.value,
                errors: dto.errors ? dto.errors : [],
                correctionOffer: dto.correctionOffer ? dto.correctionOffer : []
            };

            if (!_.isNil(dto.oldValue)) {
                annotatedSampleDataEntry.oldValue = dto.oldValue;
            }

            return annotatedSampleDataEntry;
        } catch (error) {
            throw new ClientError(
                `Error parsing input. error=${error}`
            );
        }
    }
}
