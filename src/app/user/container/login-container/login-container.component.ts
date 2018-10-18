import { Component } from '@angular/core';
import { ICredentials } from '../../../user/model/user.model';
import * as fromUser from '../../state/user.reducer';
import * as userActions from '../../state/user.actions';
import { Store } from '@ngrx/store';

@Component({
    selector: 'mibi-login-container',
    template: `<mibi-login
    (login)="login($event)">
    </mibi-login>`
})
export class LoginContainerComponent {

    constructor(
        private store: Store<fromUser.IState>) { }

    login(credentials: ICredentials) {
        this.store.dispatch(new userActions.LoginUser(credentials));
    }
}
