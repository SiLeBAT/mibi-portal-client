import { Component, OnInit, OnDestroy } from '@angular/core';
import { User, TokenizedUser } from '../../../user/model/user.model';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap, withLatestFrom } from 'rxjs/operators';
import { Institution, fromDTOToInstitution } from '../../model/institution.model';
import _ from 'lodash-es';
import { selectUserCurrentUser } from '../../state/user.selectors';
import { UserMainSlice } from '../../user.state';
import { userLogoutMSA } from '../../state/user.actions';

@Component({
    selector: 'mibi-profile-container',
    template: `<mibi-profile *ngIf="currentUser"
    [institution]="getInstitutionName()"
    [currentUser]="currentUser"
    (logout)="logout()"></mibi-profile>`
})
export class ProfileContainerComponent implements OnInit, OnDestroy {
    currentUser: User | null;
    private institution: Institution;
    private componentActive = true;
    constructor(private store$: Store<UserMainSlice>) { }

    ngOnInit() {
        this.store$.pipe(select(selectUserCurrentUser),
            withLatestFrom(this.store$),
            tap(
                (userData: [TokenizedUser | null, UserMainSlice]) => {
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
        this.store$.dispatch(userLogoutMSA());
    }

    getInstitutionName() {
        return this.institution ? this.institution.getFullName() : '';
    }
}
