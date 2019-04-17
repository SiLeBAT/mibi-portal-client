import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSamples from '../../../samples/state/samples.reducer';
import * as fromUser from '../../../user/state/user.reducer';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import * as userActions from '../../../user/state/user.actions';

@Component({
    selector: 'mibi-nav-bar-container',
    template: `<mibi-nav-bar
    [hasEntries$]="hasEntries$"
    [currentUser$]="currentUser$"
    (onLogout)="onLogout()">
    </mibi-nav-bar>`
})
export class NavBarContainerComponent implements OnInit {

    hasEntries$: Observable<boolean>;
    currentUser$: Observable<User | null>;

    constructor(
        private store$: Store<fromSamples.State>) { }

    ngOnInit() {

        this.hasEntries$ = this.store$.pipe(select(fromSamples.hasEntries));

        this.currentUser$ = this.store$.pipe(
            select(fromUser.getCurrentUser)
        );

    }

    onLogout() {
        this.store$.dispatch(new userActions.LogoutUser());
    }
}
