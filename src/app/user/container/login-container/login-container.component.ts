import { Component, OnInit, OnDestroy } from '@angular/core';
import { Credentials } from '../../../user/model/user.model';
import { Store, select } from '@ngrx/store';
import { tap, takeWhile } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { SamplesMainSlice } from '../../../samples/samples.state';
import { selectHasEntries } from '../../../samples/state/samples.selectors';
import { selectUserCurrentUser } from '../../state/user.selectors';
import { UserMainSlice } from '../../user.state';
import { userLoginSSA } from '../../state/user.actions';
import { navigateMSA } from '../../../shared/navigate/navigate.actions';
import { SamplesLinkProviderService } from '../../../samples/link-provider.service';

@Component({
    selector: 'mibi-login-container',
    template: `<mibi-login
    (login)="login($event)">
    </mibi-login>`
})
export class LoginContainerComponent implements OnInit, OnDestroy {

    private componentActive = true;
    constructor(
        private store$: Store<UserMainSlice & SamplesMainSlice>,
        private samplesLinks: SamplesLinkProviderService
    ) { }

    ngOnInit(): void {

        combineLatest([
            this.store$.pipe(select(selectUserCurrentUser)),
            this.store$.pipe(select(selectHasEntries))
        ]).pipe(
            takeWhile(() => this.componentActive),
            tap(([currentUser, hasEntries]) => {
                if (currentUser) {
                    if (hasEntries) {
                        this.store$.dispatch(navigateMSA({ path: this.samplesLinks.editor }));
                    } else {
                        this.store$.dispatch(navigateMSA({ path: this.samplesLinks.upload }));
                    }
                }
            })
        ).subscribe();
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    login(credentials: Credentials) {
        this.store$.dispatch(userLoginSSA({ credentials: credentials }));
    }
}
