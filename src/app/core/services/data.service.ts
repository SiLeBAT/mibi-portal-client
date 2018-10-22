import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IAnnotatedSampleData } from '../../samples/model/sample-management.model';
import { Institution } from '../../user/model/institution.model';
import {
    IAdminActivateResponseDTO,
    IRecoverPasswordResponseDTO,
    IRegisterUserResponseDTO,
    ILoginResponseDTO, IActivationResponseDTO, ISystemInformationResponseDTO, IValidationResponseDTO, IFAQResponseDTO
} from '../model/response.model';
import { ITokenizedUser, ICredentials, IUserDetails, User, UserData } from '../../user/model/user.model';
import { IValidationRequest } from '../model/request.model';
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

    setCurrentUser(obj: ITokenizedUser) {
        localStorage.setItem('currentUser', JSON.stringify(obj));
    }

    getCurrentUser(): ITokenizedUser | null {
        const cu: string | null = localStorage.getItem('currentUser');
        if (!cu) {
            return null;
        }
        return JSON.parse(cu);
    }

    getFAQs(): Observable<IFAQResponseDTO> {
        return this.httpClient.get<IFAQResponseDTO>(this.URL.faq);
    }

    getSystemInfo(): Observable<ISystemInformationResponseDTO> {
        return this.httpClient.get<ISystemInformationResponseDTO>(this.URL.systemInfo);
    }

    logout() {
        localStorage.removeItem('currentUser');
        return new Observable<void>().toPromise();
    }

    login(credentials: ICredentials): Observable<ILoginResponseDTO> {
        return this.httpClient.post<ILoginResponseDTO>(this.URL.login, credentials);
    }

    sendSampleSheet(sendableFormData: FormData) {
        return this.httpClient.post(this.URL.sendFile, sendableFormData).toPromise()
        .catch(() => {
            throw new ClientError('Beim Versenden ist ein Fehler aufgetreten');
        });
    }

    validateSampleData(requestData: IValidationRequest): Observable<IAnnotatedSampleData[]> {
        return this.httpClient.post<IAnnotatedSampleData[]>(this.URL.validateSample, requestData).pipe(
            map((dtoArray: IValidationResponseDTO[]) => dtoArray.map(this.fromValidationResponseDTOToAnnotatedSampleData)),
            catchError(() => {
                throw new ClientError('Beim Validieren ist ein Fehler aufgetreten');
            })
        );
    }

    getAllInstitutions(): Observable<Institution[]> {
        return this.httpClient.get<Institution[]>(this.URL.institutions);
    }

    registerUser(credentials: ICredentials, userDetails: IUserDetails): Observable<IRegisterUserResponseDTO> {
        return this.httpClient.post<IRegisterUserResponseDTO>(this.URL.register, { ...credentials, ...userDetails });
    }

    recoverPassword(email: String): Observable<IRecoverPasswordResponseDTO> {
        return this.httpClient.post<IRecoverPasswordResponseDTO>(this.URL.recovery, { email: email });
    }

    resetPassword(newPw: String, token: String) {
        return this.httpClient.post(this.URL.reset + token, { newPw: newPw });
    }

    activateAccount(token: String): Observable<boolean> {
        return this.httpClient.post<IActivationResponseDTO>(this.URL.activate + token, null).pipe(
            map(r => r.activation)
        );
    }

    adminActivateAccount(adminToken: String): Observable<IAdminActivateResponseDTO> {
        return this.httpClient.post<IAdminActivateResponseDTO>(this.URL.adminactivate + adminToken, null);
    }

    addUserData(user: User, userData: UserData) {
        return this.httpClient.post(this.URL.userdata, { user: user, userdata: userData });
    }

    updateUserData(_id: string, userData: UserData) {
        return this.httpClient.put(this.URL.userdata + _id, userData);
    }

    deleteUserData(userdataId: string, userId: string) {
        return this.httpClient.delete(this.URL.userdata + userdataId + '&' + userId);
    }

    private fromValidationResponseDTOToAnnotatedSampleData(dto: IValidationResponseDTO): IAnnotatedSampleData {
        return {
            data: dto.data,
            errors: dto.errors,
            corrections: dto.corrections,
            edits: {}
        };
    }
}
