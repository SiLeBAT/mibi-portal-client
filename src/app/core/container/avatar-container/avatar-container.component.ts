import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromUser from '../../../user/state/user.reducer';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import * as userActions from '../../../user/state/user.actions';
import { Router } from '@angular/router';

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

    constructor(private router: Router,
        private store$: Store<fromUser.UserMainState>) { }

    ngOnInit() {
        this.currentUser$ = this.store$.pipe(
            select(fromUser.selectCurrentUser)
        );

    }

    onLogout() {
        this.store$.dispatch(new userActions.LogoutUser());
    }

    onProfile() {
        this.router.navigate(['/users/profile']).catch(() => {
            throw new Error('Unable to navigate.');
        });
    }
}
