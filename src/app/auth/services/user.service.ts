import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/Rx';

import { User } from './../../models/user.model';


@Injectable()
export class UserService {

  constructor(private httpClient: HttpClient) { }

  getAll() {
    // const options = this.getJwtHeaders();

    // return this.httpClient
    //   .get('/users', options);

    return this.httpClient
      .get('/users');

  }

  getAllInstitutions() {
    return this.httpClient
      .get('/institutions');
  }

  // getById(_id: string) {
  //     return this.http.get('/user/' + _id).map((response: Response) => response.json());
  // }


  // update(user: User) {
  //     return this.http.put('/user/' + user._id, user);
  // }

  delete(_id: string) {
    // const options = this.getJwtHeaders();

    // return this.httpClient
    //   .delete('/users/' + _id, options);

    return this.httpClient
      .delete('/users/' + _id);
}

  create(user: User) {
    return this.httpClient
      .post('/users/register', user);
  }

  recoveryPassword(email: String) {
    return this.httpClient
      .post('users/recovery', {email: email});
  }

  resetPassword(newPw: String, token: String) {
    return this.httpClient
      .post('users/reset/' + token, {newPw: newPw});
  }


}
