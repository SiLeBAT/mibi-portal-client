import { Observable } from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import 'rxjs/Rx';

import { ISampleCollectionDTO, ExcelToJsonService } from './excel-to-json.service';


@Injectable()
export class ValidateService {
  public doValidation: EventEmitter<any>;
  public doSaveAsExcel: EventEmitter<any>;
  public doDownloadAndSend: EventEmitter<any>;

  constructor(private httpClient: HttpClient,
              private excelToJsonService: ExcelToJsonService) {
    this.doValidation = new EventEmitter();
    this.doSaveAsExcel = new EventEmitter();
    this.doDownloadAndSend = new EventEmitter();
  }

  validateJs( data: ISampleCollectionDTO) {
    return this.httpClient
      .post('/api/v1/upload', data.data);
  }

  sendFile( sendableFormData: FormData) {
    const postUrl = 'api/v1/job';
    const req = new HttpRequest('POST', postUrl, sendableFormData, {
      reportProgress: true
    });

    return this.httpClient
    .request(req);
  }


  onValidate() {
    this.doValidation.emit();
  }

  onSave() {
    this.doSaveAsExcel.emit();
  }

  onDownloadAndSend() {
    this.doDownloadAndSend.emit();
  }

}
