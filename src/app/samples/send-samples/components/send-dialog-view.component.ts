import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogConfiguration } from '../../../shared/dialog/dialog.model';

@Component({
    selector: 'mibi-send-dialog-view',
    templateUrl: './send-dialog-view.component.html',
    styleUrls: ['./send-dialog-view.component.scss']
})
export class SendDialogViewComponent {
    @Input()config: DialogConfiguration;

    @Output()
    confirm: EventEmitter<string> = new EventEmitter();

    @Output()
    cancel: EventEmitter<void> = new EventEmitter();

    commentControl = new FormControl('');

    onConfirm() {
        this.confirm.emit(this.commentControl.value);
    }

    onCancel() {
        this.cancel.emit();
    }
}
