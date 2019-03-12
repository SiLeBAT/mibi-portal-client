import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AnnotatedSampleData } from '../../samples/model/sample-management.model';
import { InstitutionDTO } from '../../user/model/institution.model';
import {
    AdminActivateResponseDTO,
    RecoverPasswordResponseDTO,
    RegisterUserResponseDTO,
    LoginResponseDTO, ActivationResponseDTO, SystemInformationResponseDTO, ValidationResponseDTO, FAQResponseDTO, AuthorizationResponseDTO
} from '../model/response.model';
import { TokenizedUser, Credentials } from '../../user/model/user.model';
import { ValidationRequest } from '../model/request.model';
import { ClientError } from '../model/client-error';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private API_ROOT = '/api';
    private API_VERSION = 'v1';
    private USERS = 'users';
    private UTIL = 'util';
    private URL = {
        sendFile: [this.API_ROOT, this.API_VERSION, 'job'].join('/'),
        validateSample: [this.API_ROOT, this.API_VERSION, 'validation'].join('/'),
        institutions: [this.API_ROOT, this.API_VERSION, 'institutions'].join('/'),
        login:  [this.API_ROOT, this.API_VERSION, this.USERS, 'login'].join('/'),
        register: [this.API_ROOT, this.API_VERSION, this.USERS, 'register'].join('/'),
        recovery: [this.API_ROOT, this.API_VERSION, this.USERS, 'recovery'].join('/'),
        reset: [this.API_ROOT, this.API_VERSION, this.USERS, 'reset'].join('/'),
        activate: [this.API_ROOT, this.API_VERSION, this.USERS, 'activate'].join('/'),
        adminactivate: [this.API_ROOT, this.API_VERSION, this.USERS, 'adminactivate'].join('/'),
        isAuthorized: [this.API_ROOT, this.API_VERSION, this.USERS, 'isauthorized'].join('/'),
        systemInfo: [this.API_ROOT, this.API_VERSION, this.UTIL, 'system-info'].join('/'),
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
        return new Observable<void>().toPromise();
    }

    login(credentials: Credentials): Observable<LoginResponseDTO> {
        return this.httpClient.post<LoginResponseDTO>(this.URL.login, credentials);
    }

    sendSampleSheet(sendableFormData: FormData) {
        return this.httpClient.post(this.URL.sendFile, sendableFormData).toPromise()
            .catch(() => {
                throw new ClientError('Beim Versenden ist ein Fehler aufgetreten');
            });
    }

    validateSampleData(requestData: ValidationRequest): Observable<AnnotatedSampleData[]> {
        return this.httpClient.post<AnnotatedSampleData[]>(this.URL.validateSample, requestData).pipe(
            map((dtoArray: ValidationResponseDTO[]) => dtoArray.map(this.fromValidationResponseDTOToAnnotatedSampleData)),
            catchError(() => {
                throw new ClientError('Beim Validieren ist ein Fehler aufgetreten');
            })
        );
    }

    getAllInstitutions(): Observable<InstitutionDTO[]> {
        return this.httpClient.get<InstitutionDTO[]>(this.URL.institutions);
    }

    registerUser(credentials: Credentials): Observable<RegisterUserResponseDTO> {
        return this.httpClient.post<RegisterUserResponseDTO>(this.URL.register, { ...credentials });
    }

    recoverPassword(email: String): Observable<RecoverPasswordResponseDTO> {
        return this.httpClient.post<RecoverPasswordResponseDTO>(this.URL.recovery, { email: email });
    }

    resetPassword(newPw: String, token: String) {
        return this.httpClient.post([this.URL.reset, token].join('/'), { newPw: newPw });
    }

    activateAccount(token: String): Observable<boolean> {
        return this.httpClient.post<ActivationResponseDTO>([this.URL.activate, token].join('/'), null).pipe(
            map(r => r.activation)
        );
    }

    adminActivateAccount(adminToken: String): Observable<AdminActivateResponseDTO> {
        return this.httpClient.post<AdminActivateResponseDTO>([this.URL.adminactivate, adminToken].join('/'), null);
    }

    isAuthorized(user: TokenizedUser): Observable<AuthorizationResponseDTO> {
        return this.httpClient.post<AuthorizationResponseDTO>([this.URL.isAuthorized].join('/'), user);
    }
    private fromValidationResponseDTOToAnnotatedSampleData(dto: ValidationResponseDTO): AnnotatedSampleData {
        return {
            data: dto.data,
            errors: dto.errors,
            corrections: dto.corrections,
            edits: dto.edits
        };
    }
}
