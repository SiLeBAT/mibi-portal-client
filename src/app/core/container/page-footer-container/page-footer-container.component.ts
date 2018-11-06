import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'mibi-page-footer-container',
    template: `<mibi-page-footer [supportContact]="supportContact"></mibi-page-footer>`
})
export class PageFooterContainerComponent implements OnInit {

    supportContact: string;

    constructor() { }

    ngOnInit() {
        this.supportContact = environment.supportContact;
    }

}
