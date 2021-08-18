import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { ShowBannerSOA, UpdateIsBusySOA } from '../../../core/state/core.actions';
import { NavigateMSA } from '../../../shared/navigate/navigate.actions';
import { UserMainState } from '../../state/user.reducer';

@Component({
    selector: 'mibi-reset-container',
    template: `<mibi-reset
    (reset)="reset($event)"></mibi-reset>`
})
export class ResetContainerComponent {

    constructor(
        private activatedRoute: ActivatedRoute,
        private store$: Store<UserMainState>,
        private dataService: DataService
    ) { }

    reset(password: string) {
        const token = this.activatedRoute.snapshot.params['id'];

        this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
        this.dataService.resetPassword(
            password, token).toPromise().then(
                () => {
                    this.store$.dispatch(new UpdateIsBusySOA({ isBusy: false }));
                    this.store$.dispatch(new NavigateMSA({ url: 'users/login' }));
                    this.store$.dispatch(new ShowBannerSOA({ predefined: 'passwordChangeSuccess' }));
                }
            ).catch(
                () => {
                    this.store$.dispatch(new UpdateIsBusySOA({ isBusy: false }));
                    this.store$.dispatch(new ShowBannerSOA({ predefined: 'passwordChangeFailure' }));
                }
            );
    }
}
