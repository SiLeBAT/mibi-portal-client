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
    mainButton?: ButtonConfig;
    auxilliaryButton?: ButtonConfig;
}

export interface ButtonConfig {
    label: string;
    onClick: Function;
}
