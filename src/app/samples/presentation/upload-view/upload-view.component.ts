import { Component } from '@angular/core';
import * as fromSample from '../../state/samples.reducer';
import * as samplesActions from '../../state/samples.actions';
import { Store } from '@ngrx/store';

@Component({
    selector: 'mibi-upload-view',
    templateUrl: './upload-view.component.html',
    styleUrls: ['./upload-view.component.scss']
})
export class UploadViewComponent {
    constructor(
        private store: Store<fromSample.State>) { }

    // Container not really necessary here, or is it?
    fileUpload(file: File) {
        this.store.dispatch(new samplesActions.ImportExcelFile(file));
    }
}
