import { ZomoPlanFileInfo } from '../../core/model/response.model';

export interface UserActionViewModelConfiguration {
    label: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onExecute: Function;
    type: UserActionType;
    icon?: string;
    focused?: boolean;
    zomoPlanFiles?: ZomoPlanFileInfo[];
}

export enum UserActionType {
    VALIDATE, UPLOAD, EXPORT, SEND, DISMISS_BANNER, NAVIGATE, CUSTOM, DOWNLOAD_TEMPLATE, CLOSE, DOWNLOAD_ZOMO_PLAN_FILE
}
