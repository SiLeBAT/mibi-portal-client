import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import 'rxjs/Rx';

import { ITableStructureProvider } from './json-to-table';



@Injectable()
export class UploadService {
  tableStructureProvider: ITableStructureProvider;

  constructor(private httpClient: HttpClient) { }

  uploadFile( sendableFormData: FormData) {
    const postUrl = 'api/v1/upload';
    const req = new HttpRequest('POST', postUrl, sendableFormData, {
      reportProgress: true
    });

    return this.httpClient
    .request(req);
  }

  setCurrentTableStructureProvider(tableStructureProvider: ITableStructureProvider ) {
    this.tableStructureProvider = tableStructureProvider;
  }

  getCurrentTableStructureProvider(): ITableStructureProvider {
    return this.tableStructureProvider;
  }

}

