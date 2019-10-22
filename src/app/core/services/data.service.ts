import { EntityFactoryService } from './entity-factory.service';
import { DTOFactoryService } from './dto-factory.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import {
    Sample,
    SampleSet,
    MarshalledData,
    SampleSubmission,
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
    NRLCollectionDTO,
    PutSamplesJSONResponseDTO,
    PostSubmittedResponseDTO,
    PutValidatedResponseDTO,
    NRLDTO
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
    AnnotatedOrderDTO
} from '../model/shared-dto.model';
import { InstitutionDTO } from '../../user/model/institution.model';
import { SamplesMainData } from '../../samples/state/samples.reducer';
import { InvalidInputError, InputChangedError } from '../model/data-service-error';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private API_VERSION = 'v2';
    private USER = 'users';
    private SAMPLE = 'samples';
    private TOKEN = 'tokens';
    private INSTITUTE = 'institutes';
    private NRL = 'nrls';
    private URL = {
        submit: [this.API_VERSION, this.SAMPLE, 'submitted'].join('/'),
        validate: [this.API_VERSION, this.SAMPLE, 'validated'].join('/'),
        marshal: [this.API_VERSION, this.SAMPLE].join('/'),
        unmarshal: [this.API_VERSION, this.SAMPLE].join('/'),
        institutions: [this.API_VERSION, this.INSTITUTE].join('/'),
        nrls: [this.API_VERSION, this.NRL].join('/'),
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

    constructor(
        private httpClient: HttpClient,
        private dtoService: DTOFactoryService,
        private entityFactoryService: EntityFactoryService) {
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
            order: { sampleSet: this.dtoService.fromSampleSet(sendableFormData.order) },
            comment: sendableFormData.comment,
            receiveAs: sendableFormData.receiveAs.toString()
        };
        return this.httpClient.post<PostSubmittedResponseDTO>(this.URL.submit, requestDTO).pipe(
            map((dto: PostSubmittedResponseDTO) =>
                dto.order.sampleSet.samples.map(sample => this.entityFactoryService.toSample(sample))),
            catchError(err => {
                if (err instanceof EndpointError) {
                    if (err.errorDTO.order) {
                        const order: AnnotatedOrderDTO = err.errorDTO.order;
                        const samples: Sample[] = order.sampleSet.samples.map(
                            sample => this.entityFactoryService.toSample(sample)
                        );
                        switch (err.errorDTO.code) {
                            case 5:
                                throw new InvalidInputError(samples, 'Invalid sample data error.');
                            case 6:
                                throw new InputChangedError(samples, 'Input changed error.');
                            default:
                                throw err;
                        }
                    }
                }
                throw err;
            })
        );
    }

    validateSampleData(requestData: SamplesMainData): Observable<Sample[]> {
        const requestDTO: PutValidatedRequestDTO = { order: this.dtoService.fromSamplesMainDataToOrderDTO(requestData) };
        return this.httpClient.put<PutValidatedResponseDTO>(this.URL.validate, requestDTO).pipe(
            map((dto: PutValidatedResponseDTO) =>
                dto.order.sampleSet.samples.map(sample =>
                    this.entityFactoryService.toSample(sample)
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
            map((dto: PutSamplesJSONResponseDTO) => this.entityFactoryService.toSampleSet(dto.order.sampleSet)),
            catchError((error) => {
                throw new ClientError(`Failed to read excel file. error=${error}`);
            }));
    }

    marshalJSON(requestData: SamplesMainData): Observable<MarshalledData> {
        const requestBody: PutSamplesJSONRequestDTO = { order: this.dtoService.fromSamplesMainDataToAnnotatedOrderDTO(requestData) };
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'multipart/form-data'
            })
        };
        return this.httpClient.put<PutSamplesXLSXResponseDTO>(this.URL.marshal, requestBody, httpOptions).pipe(
            map((dto: PutSamplesXLSXResponseDTO) => this.entityFactoryService.fromPutSamplesXLSXResponseDTOToMarshalledData(dto)));
    }

    getAllInstitutions(): Observable<InstitutionDTO[]> {
        return this.httpClient.get<InstituteCollectionDTO>(this.URL.institutions).pipe(
            map((dto: InstituteCollectionDTO) => {
                return dto.institutes;
            }));
    }

    getAllNRLs(): Observable<NRLDTO[]> {
        return this.httpClient.get<NRLCollectionDTO>(this.URL.nrls).pipe(
            map((dto: NRLCollectionDTO) => {
                return dto.nrls;
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
}
