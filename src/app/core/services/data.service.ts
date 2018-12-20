import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AnnotatedSampleData } from '../../samples/model/sample-management.model';
import { DefaultInstitution } from '../../user/model/institution.model';
import {
    AdminActivateResponseDTO,
    RecoverPasswordResponseDTO,
    RegisterUserResponseDTO,
    LoginResponseDTO, ActivationResponseDTO, SystemInformationResponseDTO, ValidationResponseDTO, FAQResponseDTO
} from '../model/response.model';
import { TokenizedUser, Credentials, UserDetails, DefaultUser, DefaultUserData } from '../../user/model/user.model';
import { ValidationRequest } from '../model/request.model';
import { ClientError } from '../model/client-error';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private API_ROOT = '/api';
    private API_VERSION = '/v1';
    private URL = {
        sendFile: this.API_ROOT + this.API_VERSION + '/job',
        validateSample: this.API_ROOT + this.API_VERSION + '/validation',
        institutions: this.API_ROOT + this.API_VERSION + '/institutions',
        login: this.API_ROOT + this.API_VERSION + '/users/login',
        register: this.API_ROOT + this.API_VERSION + '/users/register',
        recovery: this.API_ROOT + this.API_VERSION + '/users/recovery',
        reset: this.API_ROOT + this.API_VERSION + '/users/reset',
        activate: this.API_ROOT + this.API_VERSION + '/users/activate',
        adminactivate: this.API_ROOT + this.API_VERSION + '/users/adminactivate',
        userdata: this.API_ROOT + this.API_VERSION + '/users/userdata',
        systemInfo: this.API_ROOT + this.API_VERSION + '/util/system-info',
        faq: './assets/faq.json'
    };

    constructor(private httpClient: HttpClient) {
    }

    setCurrentUser(obj: TokenizedUser) {
        localStorage.setItem('currentUser', JSON.stringify(obj));
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

    getAllInstitutions(): Observable<DefaultInstitution[]> {
        return this.httpClient.get<DefaultInstitution[]>(this.URL.institutions);
    }

    registerUser(credentials: Credentials, userDetails: UserDetails): Observable<RegisterUserResponseDTO> {
        return this.httpClient.post<RegisterUserResponseDTO>(this.URL.register, { ...credentials, ...userDetails });
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

    addUserData(user: DefaultUser, userData: DefaultUserData) {
        return this.httpClient.post(this.URL.userdata, { user: user, userdata: userData });
    }

    updateUserData(_id: string, userData: DefaultUserData) {
        return this.httpClient.put([this.URL.userdata, _id].join('/'), userData);
    }

    deleteUserData(userdataId: string, userId: string) {
        return this.httpClient.delete([this.URL.userdata, userdataId + '&' + userId].join('/'));
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
