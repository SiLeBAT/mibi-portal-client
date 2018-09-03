import { Component } from '@angular/core';
import { LoadingSpinnerService } from '../../../core/services/loading-spinner.service';

@Component({
    selector: 'mibi-upload-view-container',
    template: `<mibi-upload-view
    [isUploadSpinnerShowing]="isUploadSpinnerShowing()">
    </mibi-upload-view>`
})
export class UploadViewContainerComponent {

    private onUploadSpinner = 'uploadSpinner';
    constructor(private spinnerService: LoadingSpinnerService) { }

    isUploadSpinnerShowing() {
        return this.spinnerService.isShowing(this.onUploadSpinner);
    }

}
