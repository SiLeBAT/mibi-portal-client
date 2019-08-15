import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DialogConfiguration } from '../dialog.model';

@Component({
    selector: 'mibi-dialog-view',
    templateUrl: './dialog-view.component.html',
    styleUrls: ['./dialog-view.component.scss']
})
export class DialogViewComponent {
    @Input()
    config: DialogConfiguration;

    @Output()
    confirm: EventEmitter<string> = new EventEmitter();

    @Output()
    cancel: EventEmitter<string> = new EventEmitter();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
