import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogConfiguration } from '../../../shared/dialog/dialog.model';
import { SamplesSlice, SamplesMainSlice } from '../../samples.state';
import { SendSamplesState } from '../state/send-samples.reducer';
import { selectSendSamplesIsFileAlreadySent } from '../state/send-samples.selectors';
import { sendSamplesSendDialogStrings, sendSamplesSendDialogConfiguration } from '../send-samples.constants';
import * as _ from 'lodash';
import { SendSamplesCancelSendSSA, SendSamplesConfirmSendSSA } from '../state/send-samples.actions';
import { selectImportedFileName } from '../../state/samples.selectors';

@Component({
    selector: 'mibi-send-dialog',
    template:
        `<mibi-send-dialog-view
            [config]="dialogConfig$ | async"
            (confirm)="onConfirm($event)"
            (cancel)="onCancel()"
        ></mibi-send-dialog-view>`
})
export class SendDialogComponent {
    private commentWarnings: string[] = [];

    dialogConfig$: Observable<DialogConfiguration> = this.store$.pipe(
        map(state => {
            const dialogConfig = _.cloneDeep(sendSamplesSendDialogConfiguration);
            if (selectSendSamplesIsFileAlreadySent(state)) {
                this.addFileAlreadySentWarning(dialogConfig, selectImportedFileName(state));
                this.commentWarnings.push(sendSamplesSendDialogStrings.commentAlreadySent);
            }
            return dialogConfig;
        })
    );

    constructor(
        private dialogRef: MatDialogRef<SendDialogComponent>,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>) { }

    onConfirm(comment: string) {
        let amendedComment = '';
        if (this.commentWarnings.length !== 0) {
            amendedComment = sendSamplesSendDialogStrings.commentWarningPreamble;
            this.commentWarnings.forEach(warning => amendedComment += warning + '\n');
        }
        amendedComment += comment;

        this.close();
        this.store$.dispatch(new SendSamplesConfirmSendSSA({ comment: amendedComment }));
    }

    onCancel() {
        this.close();
        this.store$.dispatch(new SendSamplesCancelSendSSA());
    }

    private close(): void {
        this.dialogRef.close();
    }

    private addFileAlreadySentWarning(config: DialogConfiguration, fileName: string) {
        const strings = sendSamplesSendDialogStrings;
        config.warnings.push(strings.warningAlreadySendPre + fileName + strings.warningAlreadySendPost);
        config.confirmButtonConfig.label = strings.confirmWithWarningsLabel;
    }
}
