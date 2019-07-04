export interface DialogButtonConfiguration {
    label: string;
}

export interface DialogConfiguration {
    title: string;
    message: string;
    warnings: string[];
    confirmButtonConfig: DialogButtonConfiguration;
    cancelButtonConfig?: DialogButtonConfiguration;
}
