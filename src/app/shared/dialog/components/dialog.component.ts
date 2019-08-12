import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Store, select } from '@ngrx/store';
import { DialogState } from './../state/dialog.reducer';
import { selectDialogConfiguration } from './../state/dialog.selectors';
import { Observable } from 'rxjs';
import { DialogConfirm, DialogCancel } from './../state/dialog.actions';
import { DialogConfiguration } from './../dialog.model';
import { SharedSlice } from '../../shared.state';

@Component({
    selector: 'mibi-new-dialog',
    template: `<mibi-dialog-view
    [config]="config$ | async"
    (onConfirm) = "onConfirm()"
    (onCancel) = "onCancel()">
    </mibi-dialog-view>`
})
export class NewDialogComponent {
    config$: Observable<DialogConfiguration> = this.store$.pipe(select(selectDialogConfiguration));

    constructor(
        private dialogRef: MatDialogRef<NewDialogComponent>,
        private store$: Store<SharedSlice<DialogState>>) { }

    onConfirm() {
        this.store$.dispatch(new DialogConfirm());
        this.close();
    }

    onCancel() {
        this.store$.dispatch(new DialogCancel());
        this.close();
    }

    private close(): void {
        this.dialogRef.close();
    }
}
