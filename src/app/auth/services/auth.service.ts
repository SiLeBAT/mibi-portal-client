import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SampleStore } from '../../sampleManagement/services/sampleStore.service';
import { IUser, ICredentials } from '../../models/models';

const NULL_USER: IUser = {
    email: '',
    userData: [],
    institution: '',
    _id: ''
};
@Injectable()
export class AuthService {
    currentUser: any;

    constructor(private httpClient: HttpClient,
        private router: Router,
        private sampleStore: SampleStore) { }

    login(credentials: ICredentials) {
        return this.httpClient
            .post('/api/v1/users/login', credentials);
    }

    logout() {
        const url = '/v1/users/login';
        this.sampleStore.clear();
        localStorage.removeItem('currentUser');
        this.router.navigate([url]).catch(() => {
            throw new Error('Unable to navigate.');
        });
    }

    loggedIn(): boolean {
        if (localStorage.getItem('currentUser')) {
            const cu: string | null = localStorage.getItem('currentUser');
            if (!cu) {
                return false;
            }
            const currentUser = JSON.parse(cu);
            const helper = new JwtHelperService();
            const isExpired = helper.isTokenExpired(currentUser.token);

            return !isExpired;
        }

        return false;
    }

    setCurrentUser(user: any) {
        this.currentUser = user;
    }

    getCurrentUser(): IUser {
        // console.log('AuthService getCurrentUser: ', this.currentUser);
        if (!this.currentUser) {
            const cu: string | null = localStorage.getItem('currentUser');
            if (!cu) {
                return NULL_USER;
            }
            this.currentUser = JSON.parse(cu);
        }

        return this.currentUser;
    }

}
