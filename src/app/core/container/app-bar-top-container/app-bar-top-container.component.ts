import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Store, select } from '@ngrx/store';
import * as selectFromSamples from '../../../samples/state/samples.selectors';
import * as selectFromUser from '../../../user/state/user.selectors';
import * as selectFromCore from '../../state/core.selectors';
import { map } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { User } from '../../../user/model/user.model';
import { environment } from '../../../../environments/environment';
import { UserActionViewModelConfiguration, UserActionType } from '../../../shared/model/user-action.model';
import { UserActionService } from '../../services/user-action.service';
import { SamplesMainSlice } from '../../../samples/samples.state';
import { CoreMainSlice } from '../../core.state';
import { UserMainSlice } from '../../../user/user.state';

@Component({
    selector: 'mibi-app-bar-top-container',
    template: `<mibi-app-bar-top
    [currentUser$]="currentUser$"
    [appName]="appName"
    [config$]="config$">
    </mibi-app-bar-top>`
})
export class AppBarTopContainerComponent implements OnInit {

    currentUser$: Observable<User | null>;
    appName = environment.appName;
    config$: Observable<UserActionViewModelConfiguration[]>;

    constructor(
        private store$: Store<SamplesMainSlice & CoreMainSlice & UserMainSlice>,
        private userActionService: UserActionService) { }

    ngOnInit() {
        this.currentUser$ = this.store$.pipe(
            select(selectFromUser.selectCurrentUser)
        );
        this.config$ = combineLatest([
            of(this.userActionService.userActionConfiguration),
            this.store$.pipe(select(selectFromCore.selectEnabledActionItems)),
            this.store$.pipe(select(selectFromSamples.selectHasEntries)),
            this.store$.pipe(select(selectFromUser.selectCurrentUser)),
            this.store$.pipe(select(selectFromCore.selectIsBusy))
        ]).pipe(
            map(([configuration, enabled, hasEntries, currentUser, isBusy]) => {
                if (isBusy || !enabled.length) {
                    return [];
                }
                let newConfig: UserActionViewModelConfiguration[] = [];
                if (enabled.length) {
                    enabled.forEach(enabledAction => {
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
