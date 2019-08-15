import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import * as coreActions from '../../../core/state/core.actions';
import { UserMainState } from '../../state/user.reducer';

@Component({
    selector: 'mibi-reset-container',
    template: `<mibi-reset
    (reset)="reset($event)"></mibi-reset>`
})
export class ResetContainerComponent {

    constructor(
        private activatedRoute: ActivatedRoute,
        private store: Store<UserMainState>, private dataService: DataService, private router: Router) {
    }

    reset(password: string) {

        const token = this.activatedRoute.snapshot.params['id'];

        this.dataService.resetPassword(
            password, token).toPromise().then(
                (response) => {
                    this.router.navigate(['users/login']).then(
                        () => {
                            this.store.dispatch(new coreActions.UpdateIsBusySOA({ isBusy: false }));
                            this.store.dispatch(new coreActions.DisplayBannerSOA({ predefined: 'passwordChangeSuccess' }));
                        }
                    ).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                }
            ).catch(
                (response) => {
                    this.store.dispatch(new coreActions.UpdateIsBusySOA({ isBusy: false }));
                    this.store.dispatch(new coreActions.DisplayBannerSOA({ predefined: 'passwordChangeFailure' }));
                }

            );

    }

}
