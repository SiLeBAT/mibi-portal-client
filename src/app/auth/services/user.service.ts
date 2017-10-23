import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/Rx';

import { User } from './../../models/user.model';


@Injectable()
export class UserService {

  constructor(private httpClient: HttpClient) { }

  getAll() {
    const options = this.getJwtHeaders();

    return this.httpClient
      .get('/user', options);
  }

  // getById(_id: string) {
  //     return this.http.get('/user/' + _id).map((response: Response) => response.json());
  // }


  // update(user: User) {
  //     return this.http.put('/user/' + user._id, user);
  // }

  delete(_id: string) {
    const options = this.getJwtHeaders();

    return this.httpClient
      .delete('/user/' + _id, options);
  }

  create(user: User) {
    return this.httpClient
      .post('/user/register', user);
  }


  private getJwtHeaders() {
    let options = {};

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      options = {
        headers: new HttpHeaders().set('Authorization', 'Bearer ' + currentUser.token)
      };
    }

    return options;
  }

}
