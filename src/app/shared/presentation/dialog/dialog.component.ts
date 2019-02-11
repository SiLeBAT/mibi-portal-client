import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogContent } from '../../../core/model/dialog.model';

// Old dialog system

@Component({
    selector: 'mibi-dialog',
    templateUrl: './dialog.component.html'
})
export class DialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogContent) { }

    closeDialog(): void {
        this.dialogRef.close();
    }

    ngOnInit(): void {
    }

    onMainAction() {
        this.data.mainAction.onExecute();
        this.closeDialog();
    }

    onAuxAction() {
        if (this.data.auxilliaryAction) {
            this.data.auxilliaryAction.onExecute();
        }
        this.closeDialog();
    }
}
