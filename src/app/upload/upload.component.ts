import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';
// import { ngfModule } from 'angular-file';
import { Subscription } from 'rxjs/Subscription';


import { UploadService } from '../services/upload.service';
import { concat } from 'rxjs/operators/concat';
import { AlertService } from '../auth/services/alert.service';


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
              private alertService: AlertService) {}

  uploadFiles(files: File[]) {
    console.log('uploadFiles clicked!');
    console.log('files: ', this.files);
    console.log('sendableFormData: ', this.sendableFormData);

    this.uploadService.uploadFile(this.sendableFormData)
      .subscribe((event: HttpEvent<Event>) => {
        console.log('upload file, event: ', event);
        console.log('upload file, this.file: ', this.file);
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
          console.log(`file is ${this.progress}% uploaded.`);
        } else if (event instanceof HttpResponse) {
          this.files = [];
          const message = event['body']['title'];
          this.alertService.success(message, true);
          const jsonResponse = event['body']['obj'];
          console.log('knime json response: ', jsonResponse);
        }
      }, (err: HttpErrorResponse) => {
        console.log('error upload file, err: ', err);
        const errMessage = err['error']['title'];
        this.alertService.error(errMessage, true);
        this.files = [];
      });
  }

  fileOverDropZone(event) {
    console.log('fileOverDropZone, this.files: ', this.files);
    console.log('fileOverDropZone, this.file: ', this.file);

    this.progress = 0;
    if (this.files.length > 0) {
      this.files.shift();
    }
  }

  initDropZone() {
    console.log('initDropZone processed!');
  }

  trashFile() {
    this.progress = 0;
    this.files = [];
  }

  // cancel() {
  //   this.progress = 0;
  //   if ( this.httpEmitter ) {
  //     console.log('cancelled');
  //     this.httpEmitter.unsubscribe();
  //   }
  // }





  init() {
    console.log('init done!');
  }

  ngOnInit() {
    console.log('ngOnInit done!');
  }




// ng2-file-uploader stuff

  // onUpload() {

  //   console.log('Upload Sample File clicked');

  //   this.uploadService.upload()
  //     .subscribe((data) => {

  //       console.log('knime response data: ', data);

  //       const responseData = data['obj'];
  //     }, (err: HttpErrorResponse) => {
  //       console.log('knime response err: ', err);
  //     });

  // }

  // uploadAll() {
  //   console.log('before loading, uploader: ', this.uploader);
  //   this.uploader.uploadAll();
  //   console.log('after loading, uploader: ', this.uploader);
  // }

  // // const URL = 'api/v1/knime';


  // public fileOverBase(e:any):void {
  //   this.hasBaseDropZoneOver = e;
  // }

  // public fileOverAnother(e:any):void {
  //   this.hasAnotherDropZoneOver = e;
  // }
}
