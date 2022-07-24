import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-single-center-card-layout',
    templateUrl: './single-center-card-layout.component.html',
    styleUrls: ['./single-center-card-layout.component.scss']
})
export class SingleCenterCardLayoutComponent {
    // Do not rename this to html reserved keyword "title" it will add title-tooltips to all child elements
    @Input() cardTitle: string;

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('disable-content-overflow-handling')
    disableContentOverflowHandling?: '';
}
