import { Component, Input } from '@angular/core';
import { DialogWarning } from '../dialog.model';

@Component({
    selector: 'mibi-dialog-warnings-view',
    templateUrl: './dialog-warnings-view.component.html',
    styleUrls: ['./dialog-warnings-view.component.scss']
})
export class DialogWarningsViewComponent {
    @Input() warnings: DialogWarning[];
}
