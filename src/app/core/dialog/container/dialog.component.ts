import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Store, select } from '@ngrx/store';
import { CoreSlice } from '../../core.state';
import { DialogStates } from '../store/dialog.state';
import { selectDialogConfiguration } from '../store/dialog.selectors';
import { Observable } from 'rxjs';
import { DialogConfirm, DialogCancel } from '../store/dialog.actions';
import { DialogConfiguration } from '../model/dialog-config.model';

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
        private store$: Store<CoreSlice<DialogStates>>) { }

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
