import { Component, OnInit, OnDestroy } from '@angular/core';
import { Credentials, TokenizedUser } from '../../../user/model/user.model';
import * as userActions from '../../state/user.actions';
import { Store, select } from '@ngrx/store';
import { tap, takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { SamplesMainSlice } from '../../../samples/samples.state';
import { UserMainState } from '../../state/user.reducer';
import { selectHasEntries } from '../../../samples/state/samples.selectors';
import { selectCurrentUser } from '../../state/user.selectors';
import { UserMainSlice } from '../../user.state';

@Component({
    selector: 'mibi-login-container',
    template: `<mibi-login
    (login)="login($event)">
    </mibi-login>`
})
export class LoginContainerComponent implements OnInit, OnDestroy {

    private componentActive = true;
    constructor(private router: Router,
        private store: Store<UserMainSlice & SamplesMainSlice>) { }

    ngOnInit(): void {

        combineLatest([
            this.store.pipe(select(selectCurrentUser)),
            this.store.pipe(select(selectHasEntries))
        ]).pipe(
            takeWhile(() => this.componentActive),
            tap(([currentUser, hasEntries]) => {
                if (currentUser) {
                    if (hasEntries) {
                        this.router.navigate(['/samples']).catch(() => {
                            throw new Error('Unable to navigate.');
                        });
                    } else {
                        this.router.navigate(['/users/profile']).catch(() => {
                            throw new Error('Unable to navigate.');
                        });
                    }
                }
            })
        ).subscribe();
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    login(credentials: Credentials) {
        this.store.dispatch(new userActions.LoginUser(credentials));
    }
}
