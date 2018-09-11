import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../user/model/models';
import * as userActions from '../../../user/state/user.actions';
import { IState } from '../../../state/app.state';
import { Store } from '@ngrx/store';

@Component({
    selector: 'mibi-profile-container',
    template: `<mibi-profile
    [institution]="getInstitutionName()"
    [currentUser]="currentUser"
    (logout)="logout()"></mibi-profile>`
})
export class ProfileContainerComponent implements OnInit {
    currentUser: IUser;

    constructor(
        private store: Store<IState>) { }

    ngOnInit() {
        const cu: string | null = localStorage.getItem('currentUser');
        if (cu) {
            this.currentUser = JSON.parse(cu);
        }

    }

    logout() {
        this.store.dispatch(new userActions.LogoutUser());
    }

    getInstitutionName() {
        let name = this.currentUser.institution['name1'];
        if (this.currentUser.institution['name2']) {
            name = name + ', ' + this.currentUser.institution['name2'];
        }

        return name;
    }
}
