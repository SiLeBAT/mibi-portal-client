export interface UserActionViewModelConfiguration {
    label: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onExecute: Function;
    type: UserActionType;
    icon?: string;
    focused?: boolean;
    tooltip?: string;
}

export enum UserActionType {
    VALIDATE, UPLOAD, EXPORT, SEND, DISMISS_BANNER, NAVIGATE, CUSTOM, DOWNLOAD_TEMPLATE, CLOSE
}
