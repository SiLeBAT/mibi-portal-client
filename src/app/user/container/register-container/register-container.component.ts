import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { fromDTOToInstitution, Institution, InstitutionDTO } from '../../../user/model/institution.model';
import { RegistrationDetails } from '../../model/user.model';
import { map, filter } from 'rxjs/operators';
import { selectUserInstitutions } from '../../state/user.selectors';
import { UserMainSlice } from '../../user.state';
import { Observable } from 'rxjs';
import { userRegisterSSA } from '../../register/register.actions';
import { environment } from '../../../../environments/environment';

@Component({
    standalone: false,
    selector: 'mibi-register-container',
    template: `<mibi-register *ngIf="(institutions$ | async) as institutions"
        (register)="register($event)"
        [institutions]="institutions"
        [supportContact]="supportContact">
        </mibi-register>`
})
export class RegisterContainerComponent implements OnInit {

    institutions$!: Observable<Institution[]>;
    supportContact: string = environment.supportContact;

    constructor(
        private store$: Store<UserMainSlice>
    ) { }

    ngOnInit() {
        this.loadInstitutions();
    }

    register(details: RegistrationDetails) {
        this.store$.dispatch(userRegisterSSA({ details: details }));
    }

    private loadInstitutions() {
        this.institutions$ = this.store$.pipe(
            select(selectUserInstitutions),
            filter((value) => value.length > 0),
            map((data: InstitutionDTO[]) => data.map(institution => fromDTOToInstitution(institution))
                .sort((a: Institution, b: Institution) => a.getFullName().localeCompare(b.getFullName()))));
    }
}
