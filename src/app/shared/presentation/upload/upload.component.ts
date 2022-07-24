import { Component } from '@angular/core';
import { UploadAbstractComponent } from './upload.abstract';

@Component({
    selector: 'mibi-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent extends UploadAbstractComponent {

    dropDisabled = false;

}
