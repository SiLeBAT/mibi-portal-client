import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { SampleData, IAnnotatedSampleData } from '../../samples/model/sample-management.model';
import { Observable } from 'rxjs';
import { Institution } from '../../user/model/institution.model';
import { ICredentials, ITokenizedUser, IUserDetails } from '../../user/model/models';
import { User } from '../../user/model/user.model';
import { UserData } from '../../user/model/userdata.model';
import {
    IAdminActivateResponseDTO,
    IRecoverPasswordResponseDTO, IRegisterUserResponseDTO, ILoginResponseDTO, IActivationResponseDTO
} from '../model/response.model';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private API_ROOT = '/api';
    private API_VERSION = '/v1';
    private URL = {
        sendFile: this.API_ROOT + this.API_VERSION + '/job',
        validateSample: this.API_ROOT + this.API_VERSION + '/upload',
        institutions: this.API_ROOT + this.API_VERSION + '/institutions',
        login: this.API_ROOT + this.API_VERSION + '/users/login',
        register: this.API_ROOT + this.API_VERSION + '/users/register',
        recovery: this.API_ROOT + this.API_VERSION + '/users/recovery',
        reset: this.API_ROOT + this.API_VERSION + '/users/reset',
        activate: this.API_ROOT + this.API_VERSION + '/users/activate',
        adminactivate: this.API_ROOT + this.API_VERSION + '/users/adminactivate',
        userdata: this.API_ROOT + this.API_VERSION + '/users/userdata'
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

    logout() {
        localStorage.removeItem('currentUser');
        return new Observable<void>().toPromise();
    }

    login(credentials: ICredentials): Observable<ILoginResponseDTO> {
        return this.postData<ILoginResponseDTO>(this.URL.login, credentials);
    }

    sendSampleSheet(sendableFormData: FormData) {
        return this.postFormData(this.URL.sendFile, sendableFormData);
    }

    validateSampleData(data: SampleData[]): Observable<IAnnotatedSampleData[]> {
        return this.postData<IAnnotatedSampleData[]>(this.URL.validateSample, data);
    }

    getAllInstitutions(): Observable<Institution[]> {
        return this.getData<Institution[]>(this.URL.institutions);
    }

    registerUser(credentials: ICredentials, userDetails: IUserDetails): Observable<IRegisterUserResponseDTO> {
        return this.postData(this.URL.register, { ...credentials, ...userDetails });
    }

    recoverPassword(email: String): Observable<IRecoverPasswordResponseDTO> {
        return this.postData<IRecoverPasswordResponseDTO>(this.URL.recovery, { email: email });
    }

    resetPassword(newPw: String, token: String) {
        return this.postData(this.URL.reset + token, { newPw: newPw });
    }

    activateAccount(token: String): Observable<boolean> {
        return this.postData<IActivationResponseDTO>(this.URL.activate + token, null).pipe(
            map(r => r.activation)
        );
    }

    adminActivateAccount(adminToken: String): Observable<IAdminActivateResponseDTO> {
        return this.postData(this.URL.adminactivate + adminToken, null);
    }

    addUserData(user: User, userData: UserData) {
        return this.postData(this.URL.userdata, { user: user, userdata: userData });
    }

    updateUserData(_id: string, userData: UserData) {
        return this.putData(this.URL.userdata + _id, userData);
    }

    deleteUserData(userdataId: string, userId: string) {
        return this.deleteData(this.URL.userdata + userdataId + '&' + userId);
    }

    // TODO: Remove this
    private postFormData(url: string, sendableFormData: FormData) {
        const req = new HttpRequest('POST', url, sendableFormData, {
            reportProgress: true
        });

        return this.httpClient
            .request(req).toPromise();
    }

    private postData<T>(url: string, data: any): Observable<T> {
        return this.httpClient
            .post<T>(url, data);
    }

    private putData<T>(url: string, data: any): Observable<T> {
        return this.httpClient
            .put<T>(url, data);
    }

    private deleteData<T>(url: string) {
        return this.httpClient
            .delete<T>(url);
    }

    private getData<T>(url: string): Observable<T> {
        return this.httpClient
            .get<T>(url);
    }
}
