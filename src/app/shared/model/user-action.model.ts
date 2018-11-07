import { TemplateRef } from '@angular/core';

export interface UserActionViewModelConfiguration {
    label: string;
    onExecute: Function;
    type: UserActionType;
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
export enum UserActionType {
    VALIDATE, UPLOAD, EXPORT, SEND, DISMISS_BANNER, NAVIGATE, CUSTOM, DOWNLOAD_TEMPLATE, CLOSE
}

export interface UserActionComponent {
    configuration: UserActionViewModelConfiguration;
}
