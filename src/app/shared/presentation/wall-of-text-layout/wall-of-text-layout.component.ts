import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-wall-of-text-layout',
    templateUrl: './wall-of-text-layout.component.html',
    styleUrls: ['./wall-of-text-layout.component.scss']
})
export class WallOfTextLayoutComponent {
    @Input() cardtitle: string;

    constructor() { }

}
