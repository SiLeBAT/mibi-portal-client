import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromUser from '../../state/user.reducer';
import { Store } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import * as coreActions from '../../../core/state/core.actions';

@Component({
    selector: 'mibi-reset-container',
    template: `<mibi-reset
    (reset)="reset($event)"></mibi-reset>`
})
export class ResetContainerComponent {

    constructor(
        private activatedRoute: ActivatedRoute,
        private store: Store<fromUser.IState>, private dataService: DataService, private router: Router) {
    }

    reset(password: string) {

        const token = this.activatedRoute.snapshot.params['id'];

        this.dataService.resetPassword(
            password, token).toPromise().then(
                (response) => {
                    this.router.navigate(['users/login']).then(
                        () => {
                            this.store.dispatch(new coreActions.DisplayAlert({
                                message: 'Bitte melden Sie sich mit Ihrem neuen Passwort an',
                                type: AlertType.SUCCESS
                            }));
                        }
                    ).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                }
            ).catch(
                (response) => {
                    this.store.dispatch(new coreActions.DisplayAlert({
                        // tslint:disable-next-line:max-line-length
                        message: `Fehler beim Passwort zurücksetzten, Token ungültig. Bitte lassen Sie sich einen neuen 'Passwort-Reset' Link mit Hilfe der Option 'Passwort vergessen?' zuschicken.`,
                        type: AlertType.ERROR
                    }));
                }

            );

    }

}
