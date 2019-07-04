import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSamples from '../../../samples/state/samples.state';
import * as fromUser from '../../../user/state/user.state';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import * as userActions from '../../../user/state/user.actions';
import { Samples } from '../../../samples/samples.store';
import { selectCurrentUser } from '../../../user/state/user.selectors';
import { selectHasEntries } from '../../../samples/state/samples.selectors';

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
        private store$: Store<Samples>) { }

    ngOnInit() {

        this.hasEntries$ = this.store$.pipe(select(selectHasEntries));

        this.currentUser$ = this.store$.pipe(
            select(selectCurrentUser)
        );

    }

    onLogout() {
        this.store$.dispatch(new userActions.LogoutUser());
    }
}
