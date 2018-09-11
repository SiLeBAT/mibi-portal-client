interface IModalConfiguration {
    overlay: boolean;
    overlayClickToClose: boolean;
    showCloseButton: boolean;
    confirmText: string;
    declineText: string;
}

export interface IModalContent {
    title: string;
    message?: string;
}

export interface IModal extends IModalContent {
    config: IModalConfiguration;
    show: boolean;
}
