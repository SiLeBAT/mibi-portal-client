import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { MailConfiguration } from '../../model/mail.model';
import { supportMailConfiguration } from '../../constants/support-contact.constants';

@Component({
    selector: 'mibi-footer-nav-container',
    template: `<mibi-footer-nav [supportMailConfig]="supportMailConfig"></mibi-footer-nav>`
})
export class FooterNavContainerComponent implements OnInit {

    supportMailConfig: MailConfiguration;

    constructor() { }

    ngOnInit() {
        this.supportMailConfig = supportMailConfiguration;
    }

}
