import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { tokenNotExpired } from 'angular2-jwt';

import { User } from './../../models/user.model';

@Injectable()
export class AuthService {

  constructor(private httpClient: HttpClient) { }

  login(user: User) {
      return this.httpClient
        .post('/users/login', user);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
  }

  loggedIn() {
    if (localStorage.getItem('currentUser')) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      return tokenNotExpired(null, currentUser.token);
    }

    return false;
  }

}
