interface DialogConfiguration {
    overlay: boolean;
    overlayClickToClose: boolean;
    showCloseButton: boolean;
    confirmText: string;
    declineText: string;
}

export interface DialogContent {
    title: string;
    message?: string;
}

export interface Dialog extends DialogContent {
    config: DialogConfiguration;
    show: boolean;
}
