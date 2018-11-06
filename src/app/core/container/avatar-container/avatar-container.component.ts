import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromUser from '../../../user/state/user.reducer';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import * as userActions from '../../../user/state/user.actions';

@Component({
    selector: 'mibi-avatar-container',
    template: `<mibi-avatar
    [currentUser$]="currentUser$"
    (onLogout)="onLogout()"  fxFlexFill fxLayout="row" fxLayoutAlign=" end">
    </mibi-avatar>`
})
export class AvatarContainerComponent implements OnInit {

    currentUser$: Observable<User | null>;

    constructor(
        private store: Store<fromUser.IState>) { }

    ngOnInit() {
        this.currentUser$ = this.store.pipe(
            select(fromUser.getCurrentUser)
        );

    }

    onLogout() {
        this.store.dispatch(new userActions.LogoutUser());
    }
}
