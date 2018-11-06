import { Component } from '@angular/core';
import * as fromUser from '../../state/user.reducer';
import * as coreActions from '../../../core/state/core.actions';
import { Store } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { Router } from '@angular/router';
import { UserActionService } from '../../../core/services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';

@Component({
    selector: 'mibi-recovery-container',
    template: `<mibi-recovery (recovery)="recovery($event)"></mibi-recovery>`
})
export class RecoveryContainerComponent {

    constructor(private store: Store<fromUser.IState>,
        private dataService: DataService, private router: Router, private userActionService: UserActionService) { }

    recovery(email: string) {
        this.dataService.recoverPassword(
            email).toPromise().then(
                (response) => {
                    this.router.navigate(['users/login']).then(
                        () => {
                            this.store.dispatch(new coreActions.DisplayBanner({
                                predefined: '',
                                custom: {
                                    message: response.title,
                                    type: AlertType.SUCCESS,
                                    mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                                }
                            }));
                        }
                    ).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                }
            ).catch(
                (response) => {
                    this.store.dispatch(new coreActions.DisplayBanner({
                        predefined: '',
                        custom: {
                            message: response.title,
                            type: AlertType.ERROR,
                            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                        }
                    }));
                }
            );
    }

}
