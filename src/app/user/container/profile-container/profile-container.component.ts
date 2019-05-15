import { Component, OnInit, OnDestroy } from '@angular/core';
import { User, TokenizedUser } from '../../../user/model/user.model';
import * as userActions from '../../../user/state/user.actions';
import * as fromUser from '../../../user/state/user.reducer';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap, withLatestFrom } from 'rxjs/operators';
import { Institution, fromDTOToInstitution } from '../../model/institution.model';
import * as _ from 'lodash';

@Component({
    selector: 'mibi-profile-container',
    template: `<mibi-profile
    [institution]="getInstitutionName()"
    [currentUser]="currentUser"
    (logout)="logout()"></mibi-profile>`
})
export class ProfileContainerComponent implements OnInit, OnDestroy {
    currentUser: User | null;
    private institution: Institution;
    private componentActive = true;
    constructor(
        private store: Store<fromUser.UserMainState>) { }

    ngOnInit() {
        this.store.pipe(select(fromUser.selectCurrentUser),
            withLatestFrom(this.store),
            tap(
                (userData: [TokenizedUser | null, fromUser.UserMainState]) => {
                    this.currentUser = userData[0];
                    if (this.currentUser) {
                        const queryId = this.currentUser.instituteId;
                        const institutionDTO = _.find(userData[1].user.institutes, entry => entry.id === queryId);

                        if (institutionDTO) {
                            this.institution = fromDTOToInstitution(institutionDTO);
                        }
                    }

                }
            ),
            takeWhile(() => this.componentActive)).subscribe();
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    logout() {
        this.store.dispatch(new userActions.LogoutUser());
    }

    getInstitutionName() {
        return this.institution ? this.institution.getFullName() : '';
    }
}
