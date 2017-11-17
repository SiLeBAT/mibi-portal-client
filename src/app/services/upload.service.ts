import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import 'rxjs/Rx';


@Injectable()
export class UploadService {

  constructor(private httpClient: HttpClient) { }

  upload() {
    const authValue = 'Basic ZXBpbWFuOlVmb2ZhbmFibzMzOA==';

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



}
