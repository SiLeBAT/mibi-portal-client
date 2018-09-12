import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-version-display',
    templateUrl: './version-display.component.html',
    styleUrls: ['./version-display.component.scss']
})
export class VersionDisplayComponent {
    @Input() version: string;
    @Input() artifact: string;

    constructor() { }

}
