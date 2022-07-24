import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-wall-of-text-layout',
    templateUrl: './wall-of-text-layout.component.html',
    styleUrls: ['./wall-of-text-layout.component.scss']
})
export class WallOfTextLayoutComponent {
    // Do not rename this to html reserved keyword "title" it will add title-tooltips to all child elements
    @Input() wotTitle: string;

}
