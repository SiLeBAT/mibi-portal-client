import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { UserActivation } from '../../model/user.model';
import { UserMainState } from '../../state/user.reducer';
import { DisplayBannerSOA, UpdateIsBusySOA } from '../../../core/state/core.actions';

@Component({
    selector: 'mibi-admin-activate-container',
    template: `<mibi-admin-activate
    [adminTokenValid]="adminTokenValid.activation"
    [name]="name"
    [appName]="appName"></mibi-admin-activate>`
})
export class AdminActivateContainerComponent implements OnInit {

    adminTokenValid: UserActivation;
    name: string;
    appName: string = environment.appName;
    constructor(private activatedRoute: ActivatedRoute,
        private store: Store<UserMainState>) { }

    ngOnInit() {
        this.adminTokenValid = this.activatedRoute.snapshot.data['adminTokenValid'];

        this.store.dispatch(new UpdateIsBusySOA({ isBusy: false }));

        if (this.adminTokenValid.activation) {
            this.name = this.adminTokenValid.username;
            this.store.dispatch(new DisplayBannerSOA({ predefined: 'accountActivationSuccess' }));
        } else {
            this.name = '';
            this.store.dispatch(new DisplayBannerSOA({ predefined: 'accountActivationFailure' }));
        }
    }
}
