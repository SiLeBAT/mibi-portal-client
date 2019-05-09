import { UserActionViewModelConfiguration } from '../../shared/model/user-action.model';
import { Action } from '@ngrx/store';

export interface DialogContent {
    title: string;
    message?: string;
    mainAction: UserActionViewModelConfiguration;
    auxilliaryAction?: UserActionViewModelConfiguration;
}
