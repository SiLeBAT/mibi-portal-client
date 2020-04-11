import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'mibi-layout-box',
    templateUrl: './layout-box.component.html',
    styleUrls: ['./layout-box.component.scss']
})
export class LayoutBoxComponent {

// tslint:disable-next-line: no-input-rename
    @Input('x-overflow-handling')
    xOverflowHandling: string;

// tslint:disable-next-line: no-input-rename
    @Input('y-overflow-handling')
    yOverflowHandling: string;

    @Input()
    test: string;
}
