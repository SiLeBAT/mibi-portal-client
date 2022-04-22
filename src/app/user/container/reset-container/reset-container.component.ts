import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { showBannerSOA, updateIsBusySOA } from '../../../core/state/core.actions';
import { navigateMSA } from '../../../shared/navigate/navigate.actions';
import { UserMainState } from '../../state/user.reducer';

@Component({
    selector: 'mibi-reset-container',
    template: `<mibi-reset
    (resetPassword)="onResetPassword($event)"></mibi-reset>`
})
export class ResetContainerComponent {

    constructor(
        private activatedRoute: ActivatedRoute,
        private store$: Store<UserMainState>,
        private dataService: DataService
    ) { }

    onResetPassword(password: string) {
        const token = this.activatedRoute.snapshot.params['id'];

        this.store$.dispatch(updateIsBusySOA({ isBusy: true }));
        this.dataService.resetPassword(password, token).toPromise()
            .then(() => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(navigateMSA({ url: 'users/login' }));
                this.store$.dispatch(showBannerSOA({ predefined: 'passwordChangeSuccess' }));
            })
            .catch(() => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(showBannerSOA({ predefined: 'passwordChangeFailure' }));
            });
    }
}
