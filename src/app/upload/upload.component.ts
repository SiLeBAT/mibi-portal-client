import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { UploadService } from '../services/upload.service';
import { concat } from 'rxjs/operators/concat';
import { AlertService } from '../auth/services/alert.service';
import { ExcelToJsonService, ISample13CollectionDTO, ISample14CollectionDTO } from '../services/excel-to-json.service';
import { ValidateService } from '../services/validate.service';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  sendableFormData: FormData; // populated via ngfFormData directive
  progress: number;
  httpEvent: HttpEvent<Event>;
  httpEmitter: Subscription;
  files: File[] = [];
  file: File;
  dropDisabled = false;


  constructor(private uploadService: UploadService,
              private converterService: ExcelToJsonService,
              private validateService: ValidateService,
              private alertService: AlertService,
              private router: Router) {}

  uploadFiles(files: File[]) {

    this.uploadService.uploadFile(this.sendableFormData)
      .subscribe((event: HttpEvent<Event>) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
          // console.log(`file is ${this.progress}% uploaded.`);
        } else if (event instanceof HttpResponse) {
          this.files = [];
          const message = event['body']['title'];
          this.alertService.success(message, true);
          const jsonResponse = JSON.parse(event['body']['obj']);
          this.setCurrentJsonResponse(jsonResponse);
          this.router.navigate(['/validate']);
        }
      }, (err: HttpErrorResponse) => {
        console.log('error upload file, err: ', err);
        const errMessage = err['error']['title'];
        this.alertService.error(errMessage, true);
        this.files = [];
      });
  }

  async convertToSample() {
    console.log('convertToJson, this.file: ', this.file);
    const data: (ISample13CollectionDTO | ISample14CollectionDTO) = await this.converterService.convertExcelToJSJson(this.file);
    console.log('convertToSample, data: ', data);

    if (data) {
      this.validateService.validateJs(data)
      .subscribe((event: HttpEvent<Event>) => {

        console.log('validateJs, event: ', event);

        // if (event.type === HttpEventType.UploadProgress) {
        //   this.progress = Math.round(100 * event.loaded / event.total);
          // console.log(`file is ${this.progress}% uploaded.`);
        // } else if (event instanceof HttpResponse) {

          // console.log('validateJs, event: ', event);

          // this.files = [];
          // const message = event['body']['title'];
          // this.alertService.success(message, true);
          // const jsonResponse = JSON.parse(event['body']['obj']);
          // this.setCurrentJsonResponse(jsonResponse);
          // this.router.navigate(['/validate']);
        // }
      }, (err: HttpErrorResponse) => {
        console.log('error validate json, err: ', err);
        const errMessage = err['error']['title'];
        this.alertService.error(errMessage, true);
        this.files = [];
      });
    }

  }

  blah(event) {
    console.log('blah called, event: ', event);
  }

  fileOverDropZone(event) {
    this.progress = 0;
    if (this.files.length > 0) {
      this.files.shift();
    }
  }

  trashFile() {
    this.progress = 0;
    this.files = [];
  }


  ngOnInit() { }

  setCurrentJsonResponse(jsonResponse: object) {
    this.uploadService.currentJsonResponse = jsonResponse;
  }
}
