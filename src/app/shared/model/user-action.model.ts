export interface UserActionViewModelConfiguration {
    label: string;
    onExecute: Function;
    type: UserActionType;
    icon: string;
    color: ColorType;
    focused?: boolean;
}

export enum ColorType {
    PRIMARY = 'primary',
    SECONDARY = 'accent',
    ACCENT = 'accent'
}
export enum UserActionType {
    VALIDATE, UPLOAD, EXPORT, SEND, DISMISS_BANNER, NAVIGATE, CUSTOM, DOWNLOAD_TEMPLATE, CLOSE
}
