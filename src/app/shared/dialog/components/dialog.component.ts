import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { DialogState } from './../state/dialog.reducer';
import { selectDialogData } from './../state/dialog.selectors';
import { Observable } from 'rxjs';
import { dialogConfirmMTA, dialogCancelMTA } from './../state/dialog.actions';
import { SharedSlice } from '../../shared.state';
import { map } from 'rxjs/operators';
import { DialogConfiguration } from '../dialog.model';

@Component({
    selector: 'mibi-new-dialog',
    template: `
        <mibi-dialog-view
            [config]="config$ | async"
            (confirm) = "onConfirm()"
            (cancel) = "onCancel()"
        ></mibi-dialog-view>`
})
export class NewDialogComponent {
    config$: Observable<DialogConfiguration> = this.store$.pipe(
        select(selectDialogData),
        map(data => {
            this.caller = data.caller;
            return data.configuration;
        })
    );

    private caller: string;

    constructor(
        private dialogRef: MatDialogRef<NewDialogComponent>,
        private store$: Store<SharedSlice<DialogState>>) { }

    onConfirm() {
        this.store$.dispatch(dialogConfirmMTA({ target: this.caller }));
        this.close();
    }

    onCancel() {
        this.store$.dispatch(dialogCancelMTA({ target: this.caller }));
        this.close();
    }

    private close(): void {
        this.dialogRef.close();
    }
}
