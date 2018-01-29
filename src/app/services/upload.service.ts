import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import 'rxjs/Rx';


@Injectable()
export class UploadService {

  constructor(private httpClient: HttpClient) { }

  upload() {

    // return this.httpClient
    // .post('/api/v1/knime', {authValue: authValue});

    const req = new HttpRequest(
      'POST',
      'api/v1/knime',
      '/data/projects/workspace/epilab/data/E.coli-ESBL.XLS',
      {
        reportProgress: true
      }
     );

     return this.httpClient
     .request(req);
  }

  uploadFile( sendableFormData: FormData) {
    const postUrl = 'api/v1/upload';
    const req = new HttpRequest('POST', postUrl, sendableFormData, {
      reportProgress: true
    });

    return this.httpClient
    .request(req);
  }



}
