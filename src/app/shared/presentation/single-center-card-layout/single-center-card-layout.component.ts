import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-single-center-card-layout',
    templateUrl: './single-center-card-layout.component.html',
    styleUrls: ['./single-center-card-layout.component.scss']
})
export class SingleCenterCardLayoutComponent {
    @Input() title: string;
    constructor() { }

}