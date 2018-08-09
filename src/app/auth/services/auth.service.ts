import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { tokenNotExpired } from 'angular2-jwt';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User } from '../../models/user.model';

@Injectable()
export class AuthService {
    currentUser: any;

    constructor(private httpClient: HttpClient,
        private router: Router) { }

    login(user: User) {
        return this.httpClient
            .post('/users/login', user);
    }

    logout() {
        const url = '/users/login';
        this.router.navigate([url]).catch(() => {
            throw new Error('Unable to navigate.');
        });
        if (this.router.routerState.snapshot.url === url) {
            localStorage.removeItem('currentUser');
        }
    }

    loggedIn() {
        if (localStorage.getItem('currentUser')) {
            const cu: string | null = localStorage.getItem('currentUser');
            if (!cu) {
                return '';
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

    getCurrentUser() {
        // console.log('AuthService getCurrentUser: ', this.currentUser);
        if (!this.currentUser) {
            const cu: string | null = localStorage.getItem('currentUser');
            if (!cu) {
                return '';
            }
            this.currentUser = JSON.parse(cu);
        }

        return this.currentUser;
    }

}
