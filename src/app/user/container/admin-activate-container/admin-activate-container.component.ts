import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import * as fromUser from '../../state/user.reducer';
import * as coreActions from '../../../core/state/core.actions';
import { Store } from '@ngrx/store';
import { IAdminActivateResponseDTO } from '../../../core/model/response.model';
import { AlertType } from '../../../core/model/alert.model';

@Component({
    selector: 'mibi-admin-activate-container',
    template: `<mibi-admin-activate
    [adminTokenValid]="adminTokenValid.activation"
    [name]="name"
    [appName]="appName"></mibi-admin-activate>`
})
export class AdminActivateContainerComponent implements OnInit {

    adminTokenValid: IAdminActivateResponseDTO;
    name: string;
    appName: string = environment.appName;
    constructor(private activatedRoute: ActivatedRoute,
        private store: Store<fromUser.IState>) { }

    ngOnInit() {
        this.adminTokenValid = this.activatedRoute.snapshot.data['adminTokenValid'];

        if (this.adminTokenValid.activation) {
            this.name = this.adminTokenValid.obj;
            this.store.dispatch(new coreActions.DisplayAlert({
                message: 'Kontoaktivierung erfolgreich!',
                type: AlertType.SUCCESS
            }));
        } else {
            this.name = '';
            this.store.dispatch(new coreActions.DisplayAlert({
                message: 'Unable to activate account.',
                type: AlertType.ERROR
            }));
        }
    }
}
