import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.css']
})
export class AlertComponent {
    @Input() message: string;

    constructor() { }

}
