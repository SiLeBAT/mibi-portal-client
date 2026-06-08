import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { SamplesMainSlice } from '../../samples.state';
import { importSamplesMSA } from '../../import-samples/import-samples.actions';

@Component({
    standalone: false,
    selector: 'mibi-upload-view',
    templateUrl: './upload-view.component.html',
    styleUrls: ['./upload-view.component.scss']
})
export class UploadViewComponent {
    constructor(private store$: Store<SamplesMainSlice>) {}

    fileUpload(file: File) {
        this.store$.dispatch(importSamplesMSA({ excelFile: { file: file } }));
    }
}
