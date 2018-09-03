import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-upload-view',
    templateUrl: './upload-view.component.html',
    styleUrls: ['./upload-view.component.css']
})
export class UploadViewComponent {
    @Input() isUploadSpinnerShowing: boolean;
    constructor() { }

}
