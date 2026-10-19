import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { fromDTOToInstitution, Institution, InstitutionDTO } from '../../../user/model/institution.model';
import { RegistrationDetails } from '../../model/user.model';
import { takeWhile, map, filter } from 'rxjs/operators';
import { ClientError } from '../../../core/model/client-error';
import { selectUserInstitutions } from '../../state/user.selectors';
import { selectSupportContact } from '../../../content/state/content.selectors';
import { ContentMainSlice } from '../../../content/content.state';
import { UserMainSlice } from '../../user.state';
import { Observable } from 'rxjs';
import { userRegisterSSA } from '../../register/register.actions';

@Component({
    standalone: false,
    selector: 'mibi-register-container',
    template: `<mibi-register *ngIf="(institutions$ | async) as institutions"
        (register)="register($event)"
        [institutions]="institutions"
        [supportContact]="supportContact">
        </mibi-register>`
})
export class RegisterContainerComponent implements OnInit, OnDestroy {

    institutions$!: Observable<Institution[]>;
    /** Shown on the form itself; the registration effect reads its own copy. */
    supportContact: string = '';
    private componentActive: boolean = true;

    constructor(
        private store$: Store<ContentMainSlice & UserMainSlice>
    ) { }

    ngOnInit() {
        this.loadInstitutions();
        this.store$.pipe(select(selectSupportContact),
            takeWhile(() => this.componentActive)
        ).subscribe(contact => this.supportContact = contact,
            (error) => {
                throw new ClientError(`Can't determine Support contact detail. error=${error}`);
            });
    }

    ngOnDestroy(): void {
        this.componentActive = false;
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
