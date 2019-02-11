import { UserActionViewModelConfiguration } from '../../shared/model/user-action.model';
import { Action } from '@ngrx/store';

export interface DialogContent {
    title: string;
    message?: string;
    mainAction: UserActionViewModelConfiguration;
    auxilliaryAction?: UserActionViewModelConfiguration;
}

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
