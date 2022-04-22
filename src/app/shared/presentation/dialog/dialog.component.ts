import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogContent } from '../../../core/model/dialog.model';

@Component({
    selector: 'mibi-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {

    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogContent) { }

    closeDialog(): void {
        this.dialogRef.close();
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
