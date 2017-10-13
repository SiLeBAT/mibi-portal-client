import { Http, Response, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

import { User } from './../../models/user.model';

@Injectable()
export class AuthService {

  constructor(private http: Http) { }

  login(user: User) {
    console.log(user);

      const body = JSON.stringify(user);
      const headers = new Headers({
        'content-type': 'application/json'
      });

      return this.http
        .post('/user/login', body, {headers: headers})
        .map((response: Response) =>  {
          // login successful if there's a jwt token in the response
          const responseObj = response.json();
          const user = responseObj.obj;

          console.log('AuthService.login response responseObj: ', responseObj);
          console.log('AuthService.login response user: ', user);

          if (user && user.token) {
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              localStorage.setItem('currentUser', JSON.stringify(user));
          }

          return user;
        })
        .catch((error: Response) => Observable.throw(error.json()));

  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
  }
}
