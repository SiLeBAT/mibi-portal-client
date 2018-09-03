import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICredentials, IUserDetails } from '../../user/model/models';
import { User } from '../../user/model/user.model';
import { UserData } from '../../user/model/userdata.model';
import { Observable } from 'rxjs';
import { Institution } from '../../user/model/institution.model';
import { HttpFacadeService } from '../../core/services/httpFacade.service';

// TODO: Remove HTTP calls
@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private httpClient: HttpClient, private httpFacade: HttpFacadeService) { }

    getAll() {
        // const options = this.getJwtHeaders();

        // return this.httpClient
        //   .get('/users', options);

        return this.httpClient
            .get('/api/v1/users');

    }

    getAllInstitutions(): Observable<Institution[]> {
        return this.httpFacade.getAllInstitutions();
    }

    delete(_id: string) {
        // const options = this.getJwtHeaders();

        // return this.httpClient
        //   .delete('/users/' + _id, options);

        return this.httpClient
            .delete('/api/v1/users/' + _id);
    }

    create(credentials: ICredentials, userDetails: IUserDetails) {
        return this.httpClient
            .post('/api/v1/users/register', { ...credentials, ...userDetails });
    }

    recoveryPassword(email: String) {
        return this.httpClient
            .post('api/v1/users/recovery', { email: email });
    }

    resetPassword(newPw: String, token: String) {
        return this.httpClient
            .post('api/v1/users/reset/' + token, { newPw: newPw });
    }

    activateAccount(token: String) {
        return this.httpClient
            .post('api/v1/users/activate/' + token, null);
    }

    adminActivateAccount(adminToken: String) {
        return this.httpClient
            .post('api/v1/users/adminactivate/' + adminToken, null);
    }

    addUserData(user: User, userData: UserData) {
        return this.httpClient
            .post('api/v1/users/userdata', { user: user, userdata: userData });
    }

    updateUserData(_id: string, userData: UserData) {
        return this.httpClient
            .put('api/v1/users/userdata/' + _id, userData);
    }

    deleteUserData(userdataId: string, userId: string) {
        return this.httpClient
            .delete('users/userdata/' + userdataId + '&' + userId);
    }

}
