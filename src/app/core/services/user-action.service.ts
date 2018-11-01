import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ActionItemConfiguration, ActionItemType } from '../model/action-items.model';
import { GenericActionItemComponent } from '../presentation/generic-action-item/generic-action-item.component';
import * as samplesActions from '../../samples/state/samples.actions';
import * as fromCore from '../state/core.reducer';
import * as coreActions from '../state/core.actions';
import { Store } from '@ngrx/store';
import { ClientError } from '../model/client-error';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class UserActionService {

    userActionConfiguration: ActionItemConfiguration[] = [{
        label: 'Validieren',
        type: ActionItemType.VALIDATE,
        onClick: this.validate.bind(this),
        component: GenericActionItemComponent,
        icon: 'spellcheck'
    },
    {
        label: 'Hochladen',
        type: ActionItemType.UPLOAD,
        onClick: this.import.bind(this),
        component: GenericActionItemComponent,
        icon: 'get_app'
    },
    {
        label: 'Exportieren',
        type: ActionItemType.EXPORT,
        onClick: this.export.bind(this),
        component: GenericActionItemComponent,
        icon: 'save'
    },
    {
        label: 'Senden',
        type: ActionItemType.SEND,
        onClick: this.send.bind(this),
        component: GenericActionItemComponent,
        icon: 'send'
    },
    {
        label: 'Verwerfen',
        type: ActionItemType.DISMISS_BANNER,
        onClick: this.dismissAction.bind(this),
        component: GenericActionItemComponent,
        icon: ''
    }];

    constructor(
        private store: Store<fromCore.State>, private router: Router) {
    }

    getConfigOfType(type: ActionItemType): ActionItemConfiguration {
        const config = _.find(this.userActionConfiguration, (c: ActionItemConfiguration) => c.type === type);
        return config ? { ...config } : {
            label: '',
            type: ActionItemType.DISMISS_BANNER,
            onClick: () => null,
            component: GenericActionItemComponent,
            icon: ''
        };
    }

    getNavigationConfig(url: string): ActionItemConfiguration {
        return {
            label: 'Navigieren',
            type: ActionItemType.NAVIGATE,
            onClick: this.navigate.bind(this, url),
            component: GenericActionItemComponent,
            icon: ''
        };
    }

    private navigate(url: string) {
        this.router.navigate([url]).catch(() => {
            throw new ClientError('Unable to navigate.');
        });
    }

    private validate() {
        this.store.dispatch(new samplesActions.ValidateSamples());
    }

    private export() {
        this.store.dispatch(new samplesActions.ExportExcelFile());
    }

    private import(file: File) {
        this.store.dispatch(new samplesActions.ImportExcelFile(file));
    }

    private send() {
        this.store.dispatch(new samplesActions.SendSamplesInitiate());
    }

    private dismissAction() {
        this.store.dispatch(new coreActions.ClearBanner());
    }
}
