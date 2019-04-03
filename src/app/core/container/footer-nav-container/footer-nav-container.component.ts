import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'mibi-footer-nav-container',
    template: `<mibi-footer-nav [supportContact]="supportContact"></mibi-footer-nav>`
})
export class FooterNavContainerComponent implements OnInit {

    supportContact: string;

    constructor() { }

    ngOnInit() {
        this.supportContact = environment.supportContact;
    }

}
