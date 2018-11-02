import { ActionItemConfiguration } from './action-items.model';

export interface DialogContent {
    title: string;
    message?: string;
    mainAction: ActionItemConfiguration;
    auxilliaryAction?: ActionItemConfiguration;
}
