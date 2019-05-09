import { DialogConfiguration } from '../../dialog/model/dialog-config.model';

export interface CommentDialogConfiguration extends DialogConfiguration {
    commentTitle: string;
    commentPlaceHolder?: string;
    maxCommentLength: number;
    visibleCommentLines: number;
}
