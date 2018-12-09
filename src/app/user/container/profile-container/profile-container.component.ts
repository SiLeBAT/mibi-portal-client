import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../../user/model/user.model';
import * as userActions from '../../../user/state/user.actions';
import * as fromUser from '../../../user/state/user.reducer';
import { State } from '../../../state/app.state';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap } from 'rxjs/operators';

@Component({
    selector: 'mibi-profile-container',
    template: `<mibi-profile
    [institution]="getInstitutionName()"
    [currentUser]="currentUser"
    (logout)="logout()"></mibi-profile>`
})
export class ProfileContainerComponent implements OnInit, OnDestroy {
    currentUser: User | null;
    private componentActive = true;
    constructor(
        private store: Store<State>) { }

    ngOnInit() {
        this.store.pipe(select(fromUser.getCurrentUser),
            takeWhile(() => this.componentActive),
            tap(
                currentUser => this.currentUser = currentUser
            )).subscribe();

    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    logout() {
        this.store.dispatch(new userActions.LogoutUser());
    }

    getInstitutionName() {
        if (this.currentUser) {
            let name = this.currentUser.institution['name1'];
            if (this.currentUser.institution['name2']) {
                name = name + ', ' + this.currentUser.institution['name2'];
            }

            return name;
        }
        return '';
    }
}
