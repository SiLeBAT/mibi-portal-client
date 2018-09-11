export enum AlertType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning'
}
export interface IAlert {
    type: AlertType;
    message: string;
}
