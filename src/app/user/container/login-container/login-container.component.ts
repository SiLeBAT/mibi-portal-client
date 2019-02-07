import { Component, OnInit, OnDestroy } from '@angular/core';
import { Credentials, TokenizedUser } from '../../../user/model/user.model';
import * as fromUser from '../../state/user.reducer';
import * as userActions from '../../state/user.actions';
import * as fromSamples from '../../../samples/state/samples.reducer';
import { Store, select } from '@ngrx/store';
import { tap, takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'mibi-login-container',
    template: `<mibi-login
    (login)="login($event)">
    </mibi-login>`
})
export class LoginContainerComponent implements OnInit, OnDestroy {

    private componentActive = true;
    constructor(private router: Router,
        private store: Store<fromUser.State>) { }

    ngOnInit(): void {

        combineLatest(
            this.store.pipe(select(fromUser.getCurrentUser)),
            this.store.pipe(select(fromSamples.hasEntries))
        ).pipe(
            takeWhile(() => this.componentActive),
            tap((combined: [TokenizedUser | null, boolean]) => {
                const [currentUser, hasEntries] = combined;
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
