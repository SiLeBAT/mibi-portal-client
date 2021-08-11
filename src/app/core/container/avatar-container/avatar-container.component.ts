import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import * as userActions from '../../../user/state/user.actions';
import { selectCurrentUser } from '../../../user/state/user.selectors';
import { UserMainSlice } from '../../../user/user.state';
import { NavigateMSA } from '../../../shared/navigate/navigate.actions';

@Component({
    selector: 'mibi-avatar-container',
    template: `<mibi-avatar
    [currentUser$]="currentUser$"
    (onProfile)="onProfile()"
    (onLogout)="onLogout()">
    </mibi-avatar>`
})
export class AvatarContainerComponent implements OnInit {

    currentUser$: Observable<User | null>;

    constructor(private store$: Store<UserMainSlice>) { }

    ngOnInit() {
        this.currentUser$ = this.store$.pipe(
            select(selectCurrentUser)
        );

    }

    onLogout() {
        this.store$.dispatch(new userActions.LogoutUserMSA());
    }

    onProfile() {
        this.store$.dispatch(new NavigateMSA({ url: '/users/profile' }));
    }
}
