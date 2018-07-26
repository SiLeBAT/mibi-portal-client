import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { tokenNotExpired } from 'angular2-jwt';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User } from '../../models/user.model';

@Injectable()
export class AuthService {
  currentUser;

  constructor(private httpClient: HttpClient,
              private router: Router) { }

  login(user: User) {
      return this.httpClient
        .post('/users/login', user);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.router.navigate(['/users/login']);
  }

  loggedIn() {
    if (localStorage.getItem('currentUser')) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const helper = new JwtHelperService();
      const isExpired = helper.isTokenExpired(currentUser.token);

      return !isExpired;
    }

    return false;
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  getCurrentUser() {
    // console.log('AuthService getCurrentUser: ', this.currentUser);
    if (!this.currentUser) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    return this.currentUser;
  }

}
