import { Component } from '@angular/core';
import { UserLinkProviderService } from '../../link-provider.service';

@Component({
    selector: 'mibi-login-view',
    templateUrl: './login-view.component.html',
    styleUrls: ['./login-view.component.scss']
})
export class LoginViewComponent {
    constructor(public userLinks: UserLinkProviderService) {}
}
