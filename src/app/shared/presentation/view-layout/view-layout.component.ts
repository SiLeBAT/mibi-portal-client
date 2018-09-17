import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-view-layout',
    templateUrl: './view-layout.component.html'
})
export class ViewLayoutComponent {
    @Input() title: string;

    constructor() { }

}
