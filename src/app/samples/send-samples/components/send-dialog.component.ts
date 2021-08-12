import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogConfiguration, DialogWarning } from '../../../shared/dialog/dialog.model';
import { SamplesSlice, SamplesMainSlice } from '../../samples.state';
import { SendSamplesState } from '../state/send-samples.reducer';
import { selectSendSamplesDialogWarnings } from '../state/send-samples.selectors';
import { sendSamplesSendDialogStrings } from '../send-samples.constants';
import { SendSamplesCancelSendSSA, SendSamplesConfirmSendSSA } from '../state/send-samples.actions';

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
    dialogConfig$: Observable<DialogConfiguration> = this.store$.select(selectSendSamplesDialogWarnings).pipe(
        map(warnings => this.createDialogConfiguration(warnings))
    );

    constructor(
        private dialogRef: MatDialogRef<SendDialogComponent>,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>) { }

    onConfirm(comment: string) {
        this.close();
        this.store$.dispatch(new SendSamplesConfirmSendSSA({ comment: comment }));
    }

    onCancel() {
        this.close();
        this.store$.dispatch(new SendSamplesCancelSendSSA());
    }

    private close(): void {
        this.dialogRef.close();
    }

    private createDialogConfiguration(warnings: DialogWarning[]): DialogConfiguration {
        const strings = sendSamplesSendDialogStrings;
        return {
            title: strings.title,
            message: strings.message,
            confirmButtonConfig: {
                label: warnings.length === 0 ? strings.confirmButtonLabel : strings.confirmWithWarningsButtonLabel
            },
            cancelButtonConfig: {
                label: strings.cancelButtonLabel
            },
            warnings: warnings
        };
    }
}
