import { Injectable, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import * as _ from 'lodash';
import { UserActionViewModelConfiguration, UserActionType, ColorType, UserActionComponent } from '../../shared/model/user-action.model';
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

    userActionConfiguration: UserActionViewModelConfiguration[] = [{
        label: 'Validieren',
        type: UserActionType.VALIDATE,
        onExecute: this.validate.bind(this),
        component: GenericActionItemComponent,
        icon: 'spellcheck',
        color: ColorType.ACCENT
    },
    {
        label: 'Hochladen',
        type: UserActionType.UPLOAD,
        onExecute: this.import.bind(this),
        component: GenericActionItemComponent,
        icon: 'get_app',
        color: ColorType.ACCENT
    },
    {
        label: 'Exportieren',
        type: UserActionType.EXPORT,
        onExecute: this.export.bind(this),
        component: GenericActionItemComponent,
        icon: 'save',
        color: ColorType.ACCENT
    },
    {
        label: 'Senden',
        type: UserActionType.SEND,
        onExecute: this.send.bind(this),
        component: GenericActionItemComponent,
        icon: 'send',
        color: ColorType.ACCENT
    },
    {
        label: 'Verwerfen',
        type: UserActionType.DISMISS_BANNER,
        onExecute: this.hideBanner.bind(this),
        component: GenericActionItemComponent,
        icon: '',
        color: ColorType.ACCENT
    }];

    constructor(
        private store: Store<fromCore.State>, private router: Router, private componentFactoryResolver: ComponentFactoryResolver) {
    }

    getConfigOfType(type: UserActionType): UserActionViewModelConfiguration {
        const config = _.find(this.userActionConfiguration, (c: UserActionViewModelConfiguration) => c.type === type);
        return config ? { ...config } : {
            label: '',
            type: UserActionType.CUSTOM,
            onExecute: () => null,
            component: GenericActionItemComponent,
            icon: '',
            color: ColorType.ACCENT
        };
    }

    getNavigationConfig(url: string): UserActionViewModelConfiguration {
        return {
            label: 'Navigieren',
            type: UserActionType.NAVIGATE,
            onExecute: this.navigate.bind(this, url),
            component: GenericActionItemComponent,
            icon: '',
            color: ColorType.ACCENT
        };
    }

    getOnClickHandlerOfType(type: UserActionType): Function {
        const handler = _.find(this.userActionConfiguration, (c: UserActionViewModelConfiguration) => c.type === type);
        return handler ? handler.onExecute : () => null;
    }

    createComponent(ref: ViewContainerRef, configuration: UserActionViewModelConfiguration) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(configuration.component);
        const componentRef = ref.createComponent(componentFactory);
        (componentRef.instance as UserActionComponent).configuration = configuration;
        return componentRef;
    }

    augmentOnClick(original: UserActionViewModelConfiguration, augment: Function) {
        const originalOnClick = original.onExecute;
        original.onExecute = (...args: any[]) => {
            originalOnClick(args);
            augment();
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

    private hideBanner() {
        this.store.dispatch(new coreActions.HideBanner());
    }
}
