import { ZomoPlanFileInfo } from '../../core/model/response.model';

export interface UserActionViewModelConfiguration {
    label: string;
    // Invoked from the action-item template with its $event: a File for the
    // upload action, a MouseEvent for the others, which handlers may ignore.
    onExecute: (...args: any[]) => void;
    type: UserActionType;
    icon?: string;
    focused?: boolean;
    zomoPlanFiles?: ZomoPlanFileInfo[];
}

export enum UserActionType {
    VALIDATE, UPLOAD, EXPORT, SEND, DISMISS_BANNER, NAVIGATE, CUSTOM, DOWNLOAD_TEMPLATE, CLOSE, DOWNLOAD_ZOMO_PLAN_FILE
}
