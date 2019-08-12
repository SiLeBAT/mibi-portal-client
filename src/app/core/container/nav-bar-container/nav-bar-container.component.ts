import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import * as userActions from '../../../user/state/user.actions';
import { SamplesMainSlice } from '../../../samples/samples.state';
import { selectCurrentUser } from '../../../user/state/user.selectors';
import { selectHasEntries } from '../../../samples/state/samples.selectors';
import { UserMainSlice } from '../../../user/user.state';

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
        private store$: Store<SamplesMainSlice & UserMainSlice>) { }

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
