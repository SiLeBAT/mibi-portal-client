import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { UserActionType } from '../../../shared/model/user-action.model';
import { SamplesMainSlice } from '../../samples.state';
import { showActionBarSOA } from '../../../core/state/core.actions';
import { importSamplesMSA } from '../../import-samples/import-samples.actions';

@Component({
    selector: 'mibi-upload-view',
    templateUrl: './upload-view.component.html',
    styleUrls: ['./upload-view.component.scss']
})
export class UploadViewComponent {
    constructor(private store$: Store<SamplesMainSlice>) {
        setTimeout(() => {
            this.store$.dispatch(showActionBarSOA({
                title: '',
                enabledActions: [
                    UserActionType.VALIDATE,
                    UserActionType.SEND,
                    UserActionType.EXPORT,
                    UserActionType.UPLOAD,
                    UserActionType.DOWNLOAD_TEMPLATE
                ]
            }));
        });
    }

    fileUpload(file: File) {
        this.store$.dispatch(importSamplesMSA({ excelFile: { file: file } }));
    }
}
