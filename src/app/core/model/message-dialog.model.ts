import { DialogConfiguration } from '../../core/model/dialog.model';

// New dialog system

export interface MessageDialogConfiguration extends DialogConfiguration {
    message: string;
}
