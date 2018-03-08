import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import 'rxjs/Rx';

import { ISample13CollectionDTO, ISample14CollectionDTO } from './excel-to-json.service';


@Injectable()
export class ValidateService {

  constructor(private httpClient: HttpClient) { }

  validateJs( data: (ISample13CollectionDTO | ISample14CollectionDTO)) {
    return this.httpClient
      .post('/api/v1/upload', data.data);
  }

}
