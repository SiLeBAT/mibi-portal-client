import { Component } from '@angular/core';
import { ContentLinkProviderService } from '../../../content/link-provider.service';
import { UserLinkProviderService } from '../../link-provider.service';

@Component({
    selector: 'mibi-register-view',
    templateUrl: './register-view.component.html',
    styleUrls: ['./register-view.component.scss']
})
export class RegisterViewComponent {
    constructor(
        public contentLinks: ContentLinkProviderService,
        public userLinks: UserLinkProviderService
    ) {}
}
