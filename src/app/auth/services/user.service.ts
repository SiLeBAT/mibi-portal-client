import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';

import { User } from './../../models/user.model';


@Injectable()
export class UserService {

  constructor(private http: Http) { }

  getAll() {
    return this.http.get('/users').map((response: Response) => response.json());
  }

  getById(_id: string) {
      return this.http.get('/users/' + _id).map((response: Response) => response.json());
  }


  update(user: User) {
      return this.http.put('/users/' + user._id, user);
  }

  delete(_id: string) {
      return this.http.delete('/users/' + _id);
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

/*
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { User } from '../_models/index';

@Injectable()
export class UserService {
    constructor(private http: Http) { }

    getAll() {
        return this.http.get('/users').map((response: Response) => response.json());
    }

    getById(_id: string) {
        return this.http.get('/users/' + _id).map((response: Response) => response.json());
    }

    create(user: User) {
        return this.http.post('/users/register', user);
    }

    update(user: User) {
        return this.http.put('/users/' + user._id, user);
    }

    delete(_id: string) {
        return this.http.delete('/users/' + _id);
    }
}
*/
