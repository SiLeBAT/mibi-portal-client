import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';

import { User } from './../../models/user.model';


@Injectable()
export class UserService {

  constructor(private http: Http) { }

  getAll() {
    const headers = this.getJsonAndJwtHeaders();

    return this.http
      .get('/user', {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  // getById(_id: string) {
  //     return this.http.get('/user/' + _id).map((response: Response) => response.json());
  // }


  // update(user: User) {
  //     return this.http.put('/user/' + user._id, user);
  // }

  delete(_id: string) {
    const headers = this.getJsonAndJwtHeaders();

    return this.http
      .delete('/user/' + _id, {headers: headers});
  }

  create(user: User) {
    console.log(user);

    const body = JSON.stringify(user);
    // const headers = new Headers({
    //   'content-type': 'application/json'
    // });
    const headers = this.getJsonHeaders();

    return this.http
      .post('/user/register', body, {headers: headers})
      .map((response: Response) =>  response.json())
      .catch((error: Response) => Observable.throw(error.json()));

  }

  private getJsonHeaders() {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    return headers;
  }

  private getJsonAndJwtHeaders() {
    const headers = this.getJsonHeaders();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.token) {
      headers.append('Authorization', 'Bearer ' + currentUser.token);
    }

    return headers;
  }



  // private addJwt(options?: RequestOptionsArgs): RequestOptionsArgs {
  //   // ensure request options and headers are not null
  //   options = options || new RequestOptions();
  //   options.headers = options.headers || new Headers();

  //   // add authorization header with jwt token
  //   let currentUser = JSON.parse(localStorage.getItem('currentUser'));
  //   if (currentUser && currentUser.token) {
  //       options.headers.append('Authorization', 'Bearer ' + currentUser.token);
  //   }

  //   return options;
  // }



}
