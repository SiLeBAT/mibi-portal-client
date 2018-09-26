import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-view-layout',
    templateUrl: './view-layout.component.html',
    styleUrls: ['./view-layout.component.scss']
})
export class ViewLayoutComponent {
    @Input() title: string;

    constructor() { }

}
