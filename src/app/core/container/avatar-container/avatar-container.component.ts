import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import { selectUserCurrentUser } from '../../../user/state/user.selectors';
import { UserMainSlice } from '../../../user/user.state';
import { navigateMSA } from '../../../shared/navigate/navigate.actions';
import { userLogoutMSA } from '../../../user/state/user.actions';

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
            select(selectUserCurrentUser)
        );

    }

    onLogout() {
        this.store$.dispatch(userLogoutMSA());
    }

    onProfile() {
        this.store$.dispatch(navigateMSA({ url: '/users/profile' }));
    }
}
