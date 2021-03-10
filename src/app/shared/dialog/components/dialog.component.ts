import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { DialogState, DialogData } from './../state/dialog.reducer';
import { selectDialogData } from './../state/dialog.selectors';
import { Observable } from 'rxjs';
import { DialogConfirmMTA, DialogCancelMTA } from './../state/dialog.actions';
import { SharedSlice } from '../../shared.state';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'mibi-new-dialog',
    template: `<mibi-dialog-view
    [config]="(data$ | async).configuration"
    (confirm) = "onConfirm()"
    (cancel) = "onCancel()">
    </mibi-dialog-view>`
})
export class NewDialogComponent {
    data$: Observable<DialogData> = this.store$.pipe(
        select(selectDialogData),
        tap((data) => { this.caller = data.caller; })
        );
    private caller: string;

    constructor(
        private dialogRef: MatDialogRef<NewDialogComponent>,
        private store$: Store<SharedSlice<DialogState>>) { }

    onConfirm() {
        this.store$.dispatch(new DialogConfirmMTA(this.caller));
        this.close();
    }

    onCancel() {
        this.store$.dispatch(new DialogCancelMTA(this.caller));
        this.close();
    }

    private close(): void {
        this.dialogRef.close();
    }
}
