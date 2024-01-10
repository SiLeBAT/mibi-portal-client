import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { SharedSlice } from '../../../shared/shared.state';
import { DialogState } from '../../../shared/dialog/state/dialog.reducer';
import { dialogCancelMTA } from '../../../shared/dialog/state/dialog.actions';

export interface ExcelVersionDialogData {
    title: string;
    string1: string;
    string2: string;
    string3: string;
    string4: string;
    link: string;
    string5: string;
    cancelButtonText: string;
  }

@Component({
    selector: 'mibi-send-excel-version-dialog',
    templateUrl: 'excel-version-dialog.component.html',
    styleUrls: ['./excel-version-dialog.component.scss']
})
export class ExcelVersionDialogComponent {
    private caller = '';

    constructor(
        private dialogRef: MatDialogRef<ExcelVersionDialogComponent>,
        private store$: Store<SharedSlice<DialogState>>,
        @Inject(MAT_DIALOG_DATA) public data: ExcelVersionDialogData
    ) { }

    onCancel() {
        this.store$.dispatch(dialogCancelMTA({ target: this.caller }));
        this.close();
    }

    private close(): void {
        this.dialogRef.close();
    }

}
