import { UserActionViewModelConfiguration } from '../../shared/model/user-action.model';

export interface DialogContent {
    title: string;
    message?: string;
    mainAction: UserActionViewModelConfiguration;
    auxilliaryAction?: UserActionViewModelConfiguration;
}
