import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MessageDialogConfiguration } from '../../model/message-dialog.model';
import { DialogData } from '../../model/dialog.model';

@Component({
    selector: 'mibi-message-dialog',
    templateUrl: './message-dialog.component.html'
})
export class MessageDialogComponent implements OnInit {
    config: MessageDialogConfiguration;

    @Output()
confirm: EventEmitter<any> = new EventEmitter();

    @Output()
cancel: EventEmitter<any> = new EventEmitter();

    constructor(
      @Inject(MAT_DIALOG_DATA) private data: DialogData<MessageDialogConfiguration>) {}

    ngOnInit(): void {
        this.config = this.data.configuration;
    }

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }

}
