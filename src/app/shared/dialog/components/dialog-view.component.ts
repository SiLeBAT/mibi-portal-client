import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DialogConfiguration } from '../dialog.model';

@Component({
    selector: 'mibi-dialog-view',
    templateUrl: './dialog-view.component.html',
    styleUrls: ['./dialog-view.component.scss']
})
export class DialogViewComponent {
    @Input() config: DialogConfiguration;

    @Output() confirm: EventEmitter<void> = new EventEmitter();

    @Output() cancel: EventEmitter<void> = new EventEmitter();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
