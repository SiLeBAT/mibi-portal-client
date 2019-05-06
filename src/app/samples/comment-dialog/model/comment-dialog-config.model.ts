import { DialogConfiguration } from '../../../core/dialog/model/dialog-config.model';

export interface CommentDialogConfiguration extends DialogConfiguration {
    commentTitle: string;
    commentPlaceHolder?: string;
    initialComment?: string;
}
