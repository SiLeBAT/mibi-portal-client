import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'mibi-page-body',
    templateUrl: './page-body.component.html',
    styleUrls: ['./page-body.component.scss']
})
export class PageBodyComponent {

    @Input() isBusy$: Observable<boolean>;

    constructor() { }

}
