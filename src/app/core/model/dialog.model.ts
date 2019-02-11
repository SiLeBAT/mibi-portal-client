import { UserActionViewModelConfiguration } from '../../shared/model/user-action.model';
import { Action } from '@ngrx/store';

// Old dialog system

export interface DialogContent {
    title: string;
    message?: string;
    mainAction: UserActionViewModelConfiguration;
    auxilliaryAction?: UserActionViewModelConfiguration;
}

// new dialog system

export const MATDIALOGCONFIG = {
    width : '400px'
};

export interface DialogButtonConfiguration {
    label: string;
}

export interface DialogConfiguration {
    title: string;
    confirmButtonConfig: DialogButtonConfiguration;
    cancelButtonConfig?: DialogButtonConfiguration;
}

export interface DialogData<T extends DialogConfiguration> {
    configuration: T;
    confirmAction?: Action;
    cancelAction?: Action;
}
