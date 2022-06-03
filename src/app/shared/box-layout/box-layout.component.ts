import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-box-layout',
    templateUrl: './box-layout.component.html',
    styleUrls: ['./box-layout.component.scss']
})
export class BoxLayoutComponent {

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('x-overflow-handling')
    xOverflowHandling: string;

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('y-overflow-handling')
    yOverflowHandling: string;

    @Input()
    test: string;
}
