import { TemplateRef } from '@angular/core';

export interface ActionItemConfiguration {
    label: string;
    onClick: Function;
    type: ActionItemType;
    component: any;
    icon: string;
    color: ColorType;
    focused?: boolean;
    template?: TemplateRef<any>;
}

export enum ColorType {
    PRIMARY = 'primary',
    SECONDAYR = 'accent',
    ACCENT = 'accent'
}
export enum ActionItemType {
    VALIDATE, UPLOAD, EXPORT, SEND, DISMISS_BANNER, NAVIGATE, CUSTOM
}

export interface ActionItemComponent {
    configuration: ActionItemConfiguration;
}
