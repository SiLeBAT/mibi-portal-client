import { Component, Input } from '@angular/core';
import { MailConfiguration } from '../../model/mail.model';

@Component({
    selector: 'mibi-footer-nav',
    templateUrl: './footer-nav.component.html',
    styleUrls: ['./footer-nav.component.scss']
})
export class FooterNavComponent {
    @Input() supportMailConfig: MailConfiguration;
}
