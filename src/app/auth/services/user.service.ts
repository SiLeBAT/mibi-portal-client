import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';

import { User } from './../../models/user.model';


@Injectable()
export class UserService {

  constructor(private http: Http) { }

  getAll() {
    return this.http
      .get('/user')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getById(_id: string) {
      return this.http.get('/user/' + _id).map((response: Response) => response.json());
  }


  update(user: User) {
      return this.http.put('/user/' + user._id, user);
  }

  delete(_id: string) {
      return this.http
      .delete('/user/' + _id);
  }

  create(user: User) {
    console.log(user);

    const body = JSON.stringify(user);
    const headers = new Headers({
      'content-type': 'application/json'
    });

    return this.http
      .post('/user/register', body, {headers: headers})
      .map((response: Response) =>  response.json())
      .catch((error: Response) => Observable.throw(error.json()));

  }

}
