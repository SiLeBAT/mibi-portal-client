import { Component, Input } from '@angular/core';
import { UserLinkProviderService } from '../../link-provider.service';

@Component({
    selector: 'mibi-activate',
    templateUrl: './activate.component.html',
    styleUrls: ['./activate.component.scss']
})
export class ActivateComponent {
    @Input() tokenValid: boolean;
    @Input() appName: string;

    constructor(public userLinks: UserLinkProviderService) {}
}
