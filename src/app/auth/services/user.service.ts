import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser } from '../../shared/models/models';
import { User } from '../../shared/models/user.model';
import { UserData } from '../../shared/models/userdata.model';

@Injectable()
export class UserService {

    constructor(private httpClient: HttpClient) { }

    getAll() {
        // const options = this.getJwtHeaders();

        // return this.httpClient
        //   .get('/users', options);

        return this.httpClient
            .get('/api/v1/users');

    }

    getAllInstitutions() {
        return this.httpClient
            .get('api/v1/institutions');
    }

    delete(_id: string) {
        // const options = this.getJwtHeaders();

        // return this.httpClient
        //   .delete('/users/' + _id, options);

        return this.httpClient
            .delete('/api/v1/users/' + _id);
    }

    create(user: IUser) {
        return this.httpClient
            .post('/api/v1/users/register', user);
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
