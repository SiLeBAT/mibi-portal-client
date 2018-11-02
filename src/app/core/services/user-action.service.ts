import { Injectable, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import * as _ from 'lodash';
import { ActionItemConfiguration, ActionItemType, ColorType, ActionItemComponent } from '../model/action-items.model';
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
        icon: 'spellcheck',
        color: ColorType.ACCENT
    },
    {
        label: 'Hochladen',
        type: ActionItemType.UPLOAD,
        onClick: this.import.bind(this),
        component: GenericActionItemComponent,
        icon: 'get_app',
        color: ColorType.ACCENT
    },
    {
        label: 'Exportieren',
        type: ActionItemType.EXPORT,
        onClick: this.export.bind(this),
        component: GenericActionItemComponent,
        icon: 'save',
        color: ColorType.ACCENT
    },
    {
        label: 'Senden',
        type: ActionItemType.SEND,
        onClick: this.send.bind(this),
        component: GenericActionItemComponent,
        icon: 'send',
        color: ColorType.ACCENT
    },
    {
        label: 'Verwerfen',
        type: ActionItemType.DISMISS_BANNER,
        onClick: this.dismissAction.bind(this),
        component: GenericActionItemComponent,
        icon: '',
        color: ColorType.ACCENT
    }];

    constructor(
        private store: Store<fromCore.State>, private router: Router, private componentFactoryResolver: ComponentFactoryResolver) {
    }

    getConfigOfType(type: ActionItemType): ActionItemConfiguration {
        const config = _.find(this.userActionConfiguration, (c: ActionItemConfiguration) => c.type === type);
        return config ? { ...config } : {
            label: '',
            type: ActionItemType.DISMISS_BANNER,
            onClick: () => null,
            component: GenericActionItemComponent,
            icon: '',
            color: ColorType.ACCENT
        };
    }

    getNavigationConfig(url: string): ActionItemConfiguration {
        return {
            label: 'Navigieren',
            type: ActionItemType.NAVIGATE,
            onClick: this.navigate.bind(this, url),
            component: GenericActionItemComponent,
            icon: '',
            color: ColorType.ACCENT
        };
    }

    getOnClickHandlerOfType(type: ActionItemType): Function {
        const handler = _.find(this.userActionConfiguration, (c: ActionItemConfiguration) => c.type === type);
        return handler ? handler.onClick : () => null;
    }

    createComponent(ref: ViewContainerRef, configuration: ActionItemConfiguration) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(configuration.component);
        const componentRef = ref.createComponent(componentFactory);
        (componentRef.instance as ActionItemComponent).configuration = configuration;
        return componentRef;
    }

    augmentOnClick(original: ActionItemConfiguration, augment: Function) {
        const originalOnClick = original.onClick;
        original.onClick = (...args: any[]) => {
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

    private dismissAction() {
        this.store.dispatch(new coreActions.ClearBanner());
    }
}
