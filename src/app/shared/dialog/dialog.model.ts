// Array of text parts to be concatenated to a warning message
export type DialogWarning = {
    text: string,
    emphasized?: boolean;
}[];

export interface DialogButtonConfiguration {
    label: string;
}

export interface DialogConfiguration {
    title: string;
    message: string;
    warnings: DialogWarning[];
    confirmButtonConfig: DialogButtonConfiguration;
    cancelButtonConfig?: DialogButtonConfiguration;
}
