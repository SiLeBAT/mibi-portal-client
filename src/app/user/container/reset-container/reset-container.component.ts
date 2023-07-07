import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { showBannerSOA, updateIsBusySOA } from '../../../core/state/core.actions';
import { navigateMSA } from '../../../shared/navigate/navigate.actions';
import { UserMainState } from '../../state/user.reducer';
import { UserLinkProviderService } from '../../link-provider.service';

@Component({
    selector: 'mibi-reset-container',
    template: `<mibi-reset
    (resetPassword)="onResetPassword($event)"></mibi-reset>`
})
export class ResetContainerComponent {

    constructor(
        private activatedRoute: ActivatedRoute,
        private store$: Store<UserMainState>,
        private dataService: DataService,
        private userLinks: UserLinkProviderService
    ) { }

    onResetPassword(password: string) {
        const token = this.activatedRoute.snapshot.params[this.userLinks.resetIdParam];

        this.store$.dispatch(updateIsBusySOA({ isBusy: true }));
        // eslint-disable-next-line
        this.dataService.resetPassword(password, token).toPromise()
            .then(() => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(navigateMSA({ path: this.userLinks.login }));
                this.store$.dispatch(showBannerSOA({ predefined: 'passwordChangeSuccess' }));
            })
            .catch(() => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(showBannerSOA({ predefined: 'passwordChangeFailure' }));
            });
    }
}
