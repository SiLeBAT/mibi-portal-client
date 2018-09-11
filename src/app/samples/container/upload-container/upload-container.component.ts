import { Component } from '@angular/core';
import { UploadErrorType } from '../../presentation/upload/upload.component';
import { Store } from '@ngrx/store';
import * as fromSamples from '../../state/samples.reducer';
import * as samplesActions from '../../state/samples.actions';
import * as coreActions from '../../../core/state/core.actions';
import { AlertType } from '../../../core/model/alert.model';

@Component({
    selector: 'mibi-upload-container',
    template: `<mibi-upload
    (invokeValidation)="invokeValidation($event)"
    (errorHandler)="onError($event)">
    </mibi-upload>`
})
export class UploadContainerComponent {

    constructor(
        private store: Store<fromSamples.IState>) { }

    onError(error: UploadErrorType) {
        switch (error) {
            case UploadErrorType.SIZE:
                this.store.dispatch(new coreActions.DisplayAlert({
                    type: AlertType.ERROR,
                    message: 'Zu grosse Datei: Dateien müssen kleiner als 2 Mb sein.'
                }));
                break;
            case UploadErrorType.TYPE:
                this.store.dispatch(new coreActions.DisplayAlert({
                    type: AlertType.ERROR,
                    message: 'Falscher Dateityp: Dateien müssen vom Typ .xlsx sein.'
                }));
                break;
            case UploadErrorType.CLEAR:
                this.store.dispatch(new coreActions.ClearAlert());
                break;
            default:
                this.store.dispatch(new coreActions.DisplayAlert({
                    type: AlertType.ERROR,
                    message: 'Die Datei konnte nicht hochgeladen werden.'
                }));
        }
    }

    private async readFileAndValidate(file: File) {
        this.store.dispatch(new samplesActions.ImportExcelFile(file));
    }

    invokeValidation(file: File) {
        this.readFileAndValidate(file).catch(() => {
            throw new Error('Unable to invoke validation.');
        });
    }
}
