import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FileUploader } from 'ng2-file-upload';

import { UploadService } from '../services/upload.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  public uploader: FileUploader = new FileUploader({url: 'api/v1/knime'});
  public hasBaseDropZoneOver: boolean = false;
  public hasAnotherDropZoneOver: boolean = false;

  constructor(private uploadService: UploadService ) { }

  ngOnInit() {
  }

  onUpload() {

    console.log('Upload Sample File clicked');

    this.uploadService.upload()
      .subscribe((data) => {

        console.log('knime response data: ', data);

        const responseData = data['obj'];
      }, (err: HttpErrorResponse) => {
        console.log('knime response err: ', err);
      });

  }

  // const URL = 'api/v1/knime';


  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
}
