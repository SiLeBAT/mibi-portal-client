import { MessageDialogConfiguration } from '../../core/model/message-dialog.model';

export interface SendDialogConfiguration extends MessageDialogConfiguration {
    commentMessage: string;
}
