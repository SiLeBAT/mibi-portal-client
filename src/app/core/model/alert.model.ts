import { ActionItemConfiguration } from './action-items.model';

export enum AlertType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning'
}
export interface Alert {
    type: AlertType;
    message: string;
}

export interface Banner extends Alert {
    icon?: string;
    mainAction?: ActionItemConfiguration;
    auxilliaryAction?: ActionItemConfiguration;
}
