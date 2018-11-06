import { Component, Output, EventEmitter } from '@angular/core';
import { UploadErrorType } from '../../presentation/upload/upload.component';
import { Store } from '@ngrx/store';
import * as fromCore from '../../../core/state/core.reducer';
import * as coreActions from '../../../core/state/core.actions';

@Component({
    selector: 'mibi-upload-container',
    templateUrl: './upload-container.component.html'
})
export class UploadContainerComponent {

    @Output() onFileUpload = new EventEmitter();
    constructor(
        private store: Store<fromCore.State>) { }

    onError(error: UploadErrorType) {
        switch (error) {
            case UploadErrorType.SIZE:
                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'wrongUploadFilesize' }));
                break;
            case UploadErrorType.TYPE:
                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'wrongUploadDatatype' }));
                break;
            default:
                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'uploadFailure' }));
        }
    }

    invokeValidation(file: File) {
        this.onFileUpload.emit(file);
    }
}
