import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import * as fromUser from '../../state/user.reducer';
import * as coreActions from '../../../core/state/core.actions';
import { AlertType } from '../../../core/model/alert.model';

@Component({
    selector: 'mibi-activate-container',
    template: `<mibi-activate [appName]="appName" [tokenValid]="tokenValid"></mibi-activate>`
})
export class ActivateContainerComponent implements OnInit {
    tokenValid: boolean = false;
    appName: string = environment.appName;

    constructor(private activatedRoute: ActivatedRoute,
        private router: Router,
        private store: Store<fromUser.IState>) { }

    ngOnInit() {
        this.tokenValid = this.activatedRoute.snapshot.data['tokenValid'];

        if (this.tokenValid) {
            this.store.dispatch(new coreActions.DisplayAlert({
                message: 'Kontoaktivierung erfolgreich!',
                type: AlertType.SUCCESS
            }));
        } else {
            this.store.dispatch(new coreActions.DisplayAlert({
                message: 'Unable to activate account.',
                type: AlertType.ERROR
            }));
        }
    }

    continue() {
        this.router.navigate(['users/login']).catch(() => {
            throw new Error('Unable to navigate.');
        });
    }

}
