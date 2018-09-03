import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-sample-view',
    templateUrl: './sample-view.component.html',
    styleUrls: ['./sample-view.component.css']
})
export class SampleViewComponent {

    @Input() isValidating: boolean;

    constructor() { }

}
