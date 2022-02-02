import { Component } from '@angular/core';
import _ from 'lodash-es';
import { Store, select } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserActionViewModelConfiguration, UserActionType } from '../../../shared/model/user-action.model';
import { UserActionService } from '../../services/user-action.service';
import { SamplesMainSlice } from '../../../samples/samples.state';
import { CoreMainSlice } from '../../core.state';
import { UserMainSlice } from '../../../user/user.state';
import { selectActionBarEnabled, selectActionBarTitle, selectActionBarEnabledActions, selectIsBusy } from '../../state/core.selectors';
import { selectHasEntries } from '../../../samples/state/samples.selectors';
import { selectUserCurrentUser } from '../../../user/state/user.selectors';

@Component({
    selector: 'mibi-app-bar-top-container',
    template: `<mibi-app-bar-top
        [appName]="appName"
        [actionBarEnabled]="actionBarEnabled$ | async"
        [actionBarTitle]="actionBarTitle$ | async"
        [actionConfigs]="actionConfigs$ | async"
    >
    </mibi-app-bar-top>`
})
export class AppBarTopContainerComponent {

    appName = environment.appName;
    actionBarEnabled$: Observable<boolean> = this.store$.pipe(select(selectActionBarEnabled));
    actionBarTitle$: Observable<string> = this.store$.pipe(select(selectActionBarTitle));
    actionConfigs$: Observable<UserActionViewModelConfiguration[]>;

    constructor(
        private store$: Store<SamplesMainSlice & CoreMainSlice & UserMainSlice>,
        private userActionService: UserActionService) {

        this.actionConfigs$ = combineLatest([
            this.store$.pipe(select(selectActionBarEnabledActions)),
            this.store$.pipe(select(selectHasEntries)),
            this.store$.pipe(select(selectUserCurrentUser)),
            this.store$.pipe(select(selectIsBusy))
        ]).pipe(
            map(([enabledActions, hasEntries, currentUser, isBusy]) => {
                const configuration = this.userActionService.userActionConfiguration;
                if (!enabledActions.length || isBusy) {
                    return [];
                }
                let newConfig: UserActionViewModelConfiguration[] = [];
                if (enabledActions.length) {
                    enabledActions.forEach(enabledAction => {
                        const config = _.find(configuration, (c: UserActionViewModelConfiguration) => c.type === enabledAction);
                        if (config) {
                            newConfig.push(config);
                        }
                    });
                }
                if (!hasEntries) {
                    newConfig = _.filter(newConfig, (c: UserActionViewModelConfiguration) => {
                        return c.type !== UserActionType.SEND
                            && c.type !== UserActionType.EXPORT
                            && c.type !== UserActionType.VALIDATE
                            && c.type !== UserActionType.CLOSE;
                    });
                }
                if (!currentUser) {
                    newConfig = _.filter(newConfig, (c: UserActionViewModelConfiguration) => c.type !== UserActionType.SEND);
                }

                return newConfig;
            })
        );
    }
}
