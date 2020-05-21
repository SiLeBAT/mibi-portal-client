import { UserActionViewModelConfiguration } from '../../shared/model/user-action.model';

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
    id?: string;
    icon?: string;
    mainAction: UserActionViewModelConfiguration;
    auxilliaryAction?: UserActionViewModelConfiguration;
}

export type BannerType =
    'defaultError'
    | 'defaultSuccess'
    | 'noAuthorizationOrActivation'
    | 'sendCancel'
    | 'validationFailure'
    | 'uploadFailure'
    | 'sendFailure'
    | 'sendSuccess'
    | 'validationErrors'
    | 'autocorrections'
    | 'wrongUploadDatatype'
    | 'wrongUploadFilesize'
    | 'accountActivationSuccess'
    | 'accountActivationFailure'
    | 'passwordChangeSuccess'
    | 'passwordChangeFailure'
    | 'loginFailure'
    | 'registrationFailure'
    | 'loginUnauthorized'
    | 'exportFailure';
