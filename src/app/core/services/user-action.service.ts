import { Injectable } from '@angular/core';
import _ from 'lodash';
import { UserActionViewModelConfiguration, UserActionType } from '../../shared/model/user-action.model';
import { Store } from '@ngrx/store';
import { CoreMainSlice } from '../core.state';
import { sendSamplesSSA } from '../../samples/send-samples/state/send-samples.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';

/**
 * Builds the button configurations used by banners and dialogs.
 *
 * The action bar no longer goes through here: its items are declared by the
 * feature that owns the page and dispatched back by id (see
 * main/action-bar). What remains are the buttons that banners and dialogs
 * place, which carry a callback because they act in the context that raised
 * them.
 */
@Injectable({
    providedIn: 'root'
})
export class UserActionService {

    userActionConfiguration: UserActionViewModelConfiguration[] = [{
        label: 'Schließen',
        type: UserActionType.DISMISS_BANNER,
        onExecute: () => null,
        icon: ''
    },
    {
        label: 'Senden',
        type: UserActionType.SEND,
        onExecute: this.send.bind(this),
        icon: 'send'
    }];

    constructor(
        private store$: Store<CoreMainSlice>) { }

    getConfigOfType(type: UserActionType): UserActionViewModelConfiguration {
        const config = _.find(this.userActionConfiguration, (c: UserActionViewModelConfiguration) => c.type === type);
        return config ? _.cloneDeep(config) : {
            label: '',
            type: UserActionType.CUSTOM,
            onExecute: () => null,
            icon: ''
        };
    }

    getNavigationConfig(path: string): UserActionViewModelConfiguration {
        return {
            label: 'Navigieren',
            type: UserActionType.NAVIGATE,
            onExecute: this.navigate.bind(this, path),
            icon: ''
        };
    }

    private navigate(path: string) {
        this.store$.dispatch(navigateMSA({ path: path }));
    }

    private send() {
        this.store$.dispatch(sendSamplesSSA());
    }
}
