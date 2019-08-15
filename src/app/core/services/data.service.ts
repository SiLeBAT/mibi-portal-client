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
    PutSamplesXLSXResponseDTO,
    TokenizedUserDTO,
    RegistrationRequestResponseDTO,
    PasswordResetRequestResponseDTO,
    InstituteCollectionDTO,
    PutSamplesJSONResponseDTO,
    PostSubmittedResponseDTO,
    PutValidatedResponseDTO
} from '../model/response.model';
import { TokenizedUser, Credentials, RegistrationDetails } from '../../user/model/user.model';
import {
    ResetRequestDTO,
    NewPasswordRequestDTO,
    RegistrationDetailsDTO,
    PostSubmittedRequestDTO,
    PutValidatedRequestDTO,
    PutSamplesJSONRequestDTO
} from '../model/request.model';
import { ClientError, EndpointError } from '../model/client-error';
import {
    AnnotatedSampleDataDTO,
    AnnotatedSampleDataEntryDTO,
    AnnotatedSampleSetDTO,
    AnnotatedOrderDTO,
    SampleSetMetaDTO,
    SampleSetDTO,
    SampleDataDTO
} from '../model/shared-dto.model';
import { InstitutionDTO } from '../../user/model/institution.model';
import { Urgency } from '../../samples/model/sample.enums';
import { SamplesMainData } from '../../samples/state/samples.reducer';
import { InvalidInputError, InputChangedError } from '../model/data-service-error';

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

    constructor(private httpClient: HttpClient) {
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
    }

    login(credentials: Credentials): Observable<TokenizedUser> {
        return this.httpClient.post<TokenizedUserDTO>(this.URL.login, credentials).pipe(
            map((dto: TokenizedUserDTO) => {
                return dto;
            })
        );
    }

    sendSampleSheet(sendableFormData: SampleSubmission) {
        const requestDTO: PostSubmittedRequestDTO = {
            order: { sampleSet: this.fromSampleSetToDTO(sendableFormData.order) },
            comment: sendableFormData.comment
        };
        return this.httpClient.post<PostSubmittedResponseDTO>(this.URL.submit, requestDTO).pipe(
            map((dto: PostSubmittedResponseDTO) =>
                dto.order.sampleSet.samples.map(sample => this.fromAnnotatedDTOToSampleData(sample.sampleData))),
            catchError(err => {
                if (err instanceof EndpointError) {
                    if (err.errorDTO.order) {
                        const order: AnnotatedOrderDTO = err.errorDTO.order;
                        const sampleData: SampleData[] = order.sampleSet.samples.map(
                            sample => this.fromAnnotatedDTOToSampleData(sample.sampleData)
                            );
                        switch (err.errorDTO.code) {
                            case 5:
                                throw new InvalidInputError(sampleData, 'Invalid sample data error.');
                            case 6:
                                throw new InputChangedError(sampleData, 'Input changed error.');
                            default:
                                throw err;
                        }
                    }
                }
                throw err;
            })
        );
    }

    validateSampleData(requestData: SamplesMainData): Observable<SampleData[]> {
        const requestDTO: PutValidatedRequestDTO = { order: this.fromSamplesMainDataToAnnotatedOrderDTO(requestData) };
        return this.httpClient.put<PutValidatedResponseDTO>(this.URL.validate, requestDTO).pipe(
            map((dto: PutValidatedResponseDTO) =>
                dto.order.sampleSet.samples.map(sample =>
                    this.fromAnnotatedDTOToSampleData(sample.sampleData)
                )));
    }

    unmarshalExcel(requestData: ExcelFile): Observable<SampleSet> {
        const httpOptions = {
            headers: new HttpHeaders({
                // 'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            })
        };
        const formData: FormData = new FormData();
        formData.append('file', requestData.file, requestData.file.name);
        return this.httpClient.put<PutSamplesJSONResponseDTO>(this.URL.unmarshal, formData, httpOptions).pipe(
            map((dto: PutSamplesJSONResponseDTO) => this.fromDTOToAnnotatedSampleSet(dto.order.sampleSet)),
            catchError((error) => {
                throw new ClientError(`Failed to read excel file. error=${error}`);
            }));
    }

    marshalJSON(requestData: SamplesMainData): Observable<MarshalledData> {
        const requestBody: PutSamplesJSONRequestDTO = { order: this.fromSamplesMainDataToAnnotatedOrderDTO(requestData) };
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'multipart/form-data'
            })
        };
        return this.httpClient.put<PutSamplesXLSXResponseDTO>(this.URL.marshal, requestBody, httpOptions).pipe(
            map((dto: PutSamplesXLSXResponseDTO) => this.fromPutSamplesXLSXResponseDTOToMarshalledData(dto)));
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

    private fromPutSamplesXLSXResponseDTOToMarshalledData(dto: PutSamplesXLSXResponseDTO): MarshalledData {
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
                return this.fromAnnotatedDTOToSampleData(sampleContainerDTO.sampleData);
            })
        };
        return annotatedSampleSet;
    }

    private fromSampleSetToAnnotatedDTO(sampleSet: SampleSet): AnnotatedSampleSetDTO {
        const dto: AnnotatedSampleSetDTO = {
            meta: this.fromSampleSetMetaDataToDTO(sampleSet.meta),
            samples: sampleSet.samples.map(sample => ({ sampleData: sample }))
        };
        return dto;
    }

    private fromSampleSetToDTO(sampleSet: SampleSet): SampleSetDTO {
        const dto: SampleSetDTO = {
            meta: this.fromSampleSetMetaDataToDTO(sampleSet.meta),
            samples: sampleSet.samples.map(sample => ({ sampleData: this.fromSampleDataToDTO(sample) }))
        };
        return dto;
    }

    private fromSampleDataToDTO(sampleData: SampleData): SampleDataDTO {
        const dto: SampleDataDTO = {};
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
            urgency: this.fromUrgencyStringToEnum(dto.urgency),
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

    private fromUrgencyStringToEnum(str: string): Urgency {
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
        return { sampleSet: dto };
    }

    fromAnnotatedDTOToSampleData(dto: AnnotatedSampleDataDTO): SampleData {
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
