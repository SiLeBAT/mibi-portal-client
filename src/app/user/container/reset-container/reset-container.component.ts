import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserLinkProviderService } from '../../link-provider.service';
import { userResetPasswordSSA } from '../../reset-password/reset-password.actions';

@Component({
    standalone: false,
    selector: 'mibi-reset-container',
    template: `<mibi-reset
    (resetPassword)="onResetPassword($event)"></mibi-reset>`
})
export class ResetContainerComponent {

    constructor(
        private activatedRoute: ActivatedRoute,
        private store$: Store,
        private userLinks: UserLinkProviderService
    ) { }

    onResetPassword(password: string) {
        // The token identifies the reset request and only the route carries it.
        const token = this.activatedRoute.snapshot.params[this.userLinks.resetIdParam];

        this.store$.dispatch(userResetPasswordSSA({
            password: password,
            token: token
        }));
    }
}
