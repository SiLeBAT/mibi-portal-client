import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import 'rxjs/Rx';

import { ISampleCollectionDTO } from './excel-to-json.service';


@Injectable()
export class ValidateService {

  constructor(private httpClient: HttpClient) { }

  validateJs( data: ISampleCollectionDTO) {
    return this.httpClient
      .post('/api/v1/upload', data.data);
  }

}
