import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { UserActionType } from '../../../shared/model/user-action.model';
import { SamplesMainSlice } from '../../samples.state';
import { ShowActionBarSOA } from '../../../core/state/core.actions';
import { UploadSamplesMSA } from '../../upload-samples.ts/upload-samples.actions';

@Component({
    selector: 'mibi-upload-view',
    templateUrl: './upload-view.component.html',
    styleUrls: ['./upload-view.component.scss']
})
export class UploadViewComponent {

    constructor(private store$: Store<SamplesMainSlice>) {
        this.store$.dispatch(new ShowActionBarSOA({
            title: '',
            enabledActions: [
                UserActionType.VALIDATE,
                UserActionType.SEND,
                UserActionType.EXPORT,
                UserActionType.UPLOAD,
                UserActionType.DOWNLOAD_TEMPLATE
            ]
        }));
    }

    fileUpload(file: File) {
        this.store$.dispatch(new UploadSamplesMSA({ excelFile: { file } }));
    }
}
