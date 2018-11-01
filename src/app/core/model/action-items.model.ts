import { TemplateRef } from '@angular/core';

export interface ActionItemConfiguration {
    label: string;
    onClick: Function;
    type: ActionItemType;
    component: any;
    icon: string;
    template?: TemplateRef<any>;
}

export enum ActionItemType {
    VALIDATE, UPLOAD, EXPORT, SEND, DISMISS_BANNER, NAVIGATE
}

export interface ActionItemComponent {
    configuration: ActionItemConfiguration;
}
