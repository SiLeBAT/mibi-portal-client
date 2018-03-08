import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import 'rxjs/Rx';


@Injectable()
export class UploadService {
  currentJsonResponse: object;

  constructor(private httpClient: HttpClient) { }

  uploadFile( sendableFormData: FormData) {
    const postUrl = 'api/v1/upload';
    const req = new HttpRequest('POST', postUrl, sendableFormData, {
      reportProgress: true
    });

    return this.httpClient
    .request(req);
  }



}
