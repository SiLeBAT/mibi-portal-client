import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
    ExcelFile,
    MarshalledData,
    Sample,
    SampleSet,
    SampleSubmission
} from '../../samples/model/sample-management.model';
import { SamplesMainData } from '../../samples/state/samples.reducer';
import { InstitutionDTO } from '../../user/model/institution.model';
import { Credentials, RegistrationDetails, TokenizedUser } from '../../user/model/user.model';
import { ClientError, EndpointError } from '../model/client-error';
import { ExcelVersionError, InputChangedError, InvalidInputError } from '../model/data-service-error';
import {
    NewPasswordRequestDTO,
    PostSubmittedRequestDTO,
    PutSamplesJSONRequestDTO,
    PutValidatedRequestDTO,
    RegistrationDetailsDTO,
    ResetRequestDTO
} from '../model/request.model';
import {
    ActivationResponseDTO,
    FaqResponseDTO,
    NRLCollectionDTO,
    NRLDTO,
    ParseInstitutionDTO,
    ParseResponse,
    PasswordResetRequestResponseDTO,
    PostSubmittedResponseDTO,
    PutSamplesJSONResponseDTO,
    PutSamplesXLSXResponseDTO,
    PutValidatedResponseDTO,
    RegistrationRequestResponseDTO,
    SystemInformationResponseDTO,
    TokenRefreshResponseDTO,
    TokenizedUserDTO
} from '../model/response.model';
import {
    AnnotatedOrderDTO
} from '../model/shared-dto.model';
import { DTOFactoryService } from './dto-factory.service';
import { EntityFactoryService } from './entity-factory.service';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private PARSE_REST_API = 'admin/parse/classes';
    private API_VERSION = 'v2';
    private USER = 'users';
    private SAMPLE = 'samples';
    private TOKEN = 'tokens';
    private INSTITUTE = 'institutions';
    private NRL = 'nrls';
    private URL = {
        submit: [this.API_VERSION, this.SAMPLE, 'submitted'].join('/'),
        validate: [this.API_VERSION, this.SAMPLE, 'validated'].join('/'),
        marshal: [this.API_VERSION, this.SAMPLE].join('/'),
        unmarshal: [this.API_VERSION, this.SAMPLE].join('/'),
        institutions: [this.PARSE_REST_API, this.INSTITUTE].join('/'),
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

    private LOCAL_STORAGE_CURRENT_USER = 'currentUser';

    private parseOptions = {
        headers: {
            ['X-Parse-Application-Id']: environment.appId
        }
    };

    constructor(
        private httpClient: HttpClient,
        private dtoService: DTOFactoryService,
        private entityFactoryService: EntityFactoryService) {
    }

    getCurrentUser(): TokenizedUser | null {
        const userJson: string | null = localStorage.getItem(this.LOCAL_STORAGE_CURRENT_USER);
        if (userJson !== null) {
            return JSON.parse(userJson);
        }
        return null;
    }

    setCurrentUser(user: TokenizedUser): void {
        localStorage.setItem(this.LOCAL_STORAGE_CURRENT_USER, JSON.stringify(user));
    }

    removeCurrentUser(): void {
        localStorage.removeItem(this.LOCAL_STORAGE_CURRENT_USER);
    }

    getFaq(): Observable<FaqResponseDTO> {
        return this.httpClient.get<FaqResponseDTO>(this.URL.faq);
    }

    getSystemInfo(): Observable<SystemInformationResponseDTO> {
        return this.httpClient.get<SystemInformationResponseDTO>(this.URL.systemInfo);
    }

    login(credentials: Credentials): Observable<TokenizedUser> {
        return this.httpClient.post<TokenizedUserDTO>(this.URL.login, credentials).pipe(
            map((dto: TokenizedUserDTO) => dto)
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
            catchError((err) => {
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
        const encodedFileName = encodeURIComponent(requestData.file.name);
        formData.append('file', requestData.file, encodedFileName);
        return this.httpClient.put<PutSamplesJSONResponseDTO>(this.URL.unmarshal, formData, httpOptions).pipe(
            map((dto: PutSamplesJSONResponseDTO) => this.entityFactoryService.toSampleSet(dto.order.sampleSet)),
            catchError((error) => {
                if (error instanceof EndpointError) {
                    if (error.errorDTO.version) {
                        const excelVersion: string = error.errorDTO.version;
                        switch (error.errorDTO.code) {
                            case 7:
                                throw new ExcelVersionError(excelVersion, 'Invalid excel version error.');
                            default:
                                throw error;
                        }
                    }
                }

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
        return this.httpClient.get<ParseResponse<ParseInstitutionDTO>>(this.URL.institutions, this.parseOptions).pipe(
            map((dto: ParseResponse<ParseInstitutionDTO>) => dto.results.map(institution => ({
                id: institution.objectId,
                short: institution.state_short,
                name: institution.name1,
                addendum: institution.name2 || '',
                city: institution.city || '',
                zip: institution.zip || '',
                phone: institution.phone,
                fax: institution.fax || '',
                email: institution.email || []
            }))));
    }

    getAllNRLs(): Observable<NRLDTO[]> {
        return this.httpClient.get<NRLCollectionDTO>(this.URL.nrls).pipe(
            map((dto: NRLCollectionDTO) => dto.nrls));
    }

    registrationRequest(registrationDetails: RegistrationDetails): Observable<RegistrationRequestResponseDTO> {
        const registrationDetailsDTO: RegistrationDetailsDTO = { ...registrationDetails };
        return this.httpClient.post<RegistrationRequestResponseDTO>(this.URL.register, registrationDetailsDTO);
    }

    resetPasswordRequest(email: string): Observable<PasswordResetRequestResponseDTO> {
        const resetRequest: ResetRequestDTO = { email: email };
        return this.httpClient.put<PasswordResetRequestResponseDTO>(this.URL.resetPasswordRequest, resetRequest);
    }

    resetPassword(password: string, token: string) {
        const newPassword: NewPasswordRequestDTO = { password: password };
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
