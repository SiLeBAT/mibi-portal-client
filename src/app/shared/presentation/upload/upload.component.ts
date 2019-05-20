import { Component } from '@angular/core';
import { UploadAbstractComponent } from './upload.abstract';

@Component({
    selector: 'mibi-upload',
    templateUrl: './upload.component.html'
})
export class UploadComponent extends UploadAbstractComponent {

    dropDisabled = false;

    constructor() {
        super();
    }

}
