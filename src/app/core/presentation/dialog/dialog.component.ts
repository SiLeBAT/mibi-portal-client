import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogConfiguration, DialogData } from '../../model/dialog.model';
import { Store } from '@ngrx/store';
import { DialogComponent } from '../../../shared/presentation/dialog/dialog.component';

// New dialog system
// TODO: Rename NewDialogComponent to DialogComponent

@Component({
    selector: 'mibi-new-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss']
})
export class NewDialogComponent implements OnInit {
    config: DialogConfiguration;

    @Output()
  confirm: EventEmitter<any> = new EventEmitter();

    @Output()
  cancel: EventEmitter<any> = new EventEmitter();

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: DialogData<DialogConfiguration>,
        private dialogRef: MatDialogRef<DialogComponent>,
        private store: Store<any>) { }

    ngOnInit(): void {
        this.config = this.data.configuration;
    }

    onConfirm() {
        if (this.data.confirmAction) {
            this.store.dispatch(this.data.confirmAction);
        } else {
            this.confirm.emit();
        }
        this.close();
    }

    onCancel() {
        if (this.data.cancelAction) {
            this.store.dispatch(this.data.cancelAction);
        } else {
            this.cancel.emit();
        }
        this.close();
    }

    private close(): void {
        this.dialogRef.close();
    }
}
