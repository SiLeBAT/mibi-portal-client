import { Component, Input } from '@angular/core';
import { IAlert } from '../../model/alert.model';

@Component({
    selector: 'mibi-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
    @Input() alert: IAlert;

    constructor() { }

}
