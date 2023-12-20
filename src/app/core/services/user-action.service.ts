import { Injectable } from '@angular/core';
import _ from 'lodash';
import { UserActionViewModelConfiguration, UserActionType } from '../../shared/model/user-action.model';
import { Store } from '@ngrx/store';
import { validateSamplesSSA } from '../../samples/validate-samples/validate-samples.actions';
import { CoreMainSlice } from '../core.state';
import { environment } from '../../../environments/environment';
import { closeSamplesSSA } from '../../samples/close-samples/close-samples.actions';
import { importSamplesMSA } from '../../samples/import-samples/import-samples.actions';
import { exportSamplesSSA } from '../../samples/export-samples/export-samples.actions';
import { sendSamplesSSA } from '../../samples/send-samples/state/send-samples.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';

@Injectable({
    providedIn: 'root'
})
export class UserActionService {

    userActionConfiguration: UserActionViewModelConfiguration[] = [{
        label: 'Validieren',
        type: UserActionType.VALIDATE,
        onExecute: this.validate.bind(this),
        icon: 'spellcheck'
    },
    {
        label: 'Hochladen',
        type: UserActionType.UPLOAD,
        onExecute: this.import.bind(this),
        icon: 'publish'
    },
    {
        label: 'Exportieren',
        type: UserActionType.EXPORT,
        onExecute: this.export.bind(this),
        icon: 'file_copy'
    },
    {
        label: 'Senden',
        type: UserActionType.SEND,
        onExecute: this.send.bind(this),
        icon: 'send'
    },
    {
        label: 'Schließen',
        type: UserActionType.DISMISS_BANNER,
        onExecute: () => null,
        icon: ''
    },
    {
        label: 'Schließen',
        type: UserActionType.CLOSE,
        onExecute: this.close.bind(this),
        icon: 'clear'
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

    private validate() {
        this.store$.dispatch(validateSamplesSSA());
    }

    private export() {
        this.store$.dispatch(exportSamplesSSA());
    }

    private import(file: File) {
        this.store$.dispatch(importSamplesMSA({ excelFile: { file: file } }));
    }

    private send() {
        this.store$.dispatch(sendSamplesSSA());
    }

    private close() {
        this.store$.dispatch(closeSamplesSSA());
    }
}
