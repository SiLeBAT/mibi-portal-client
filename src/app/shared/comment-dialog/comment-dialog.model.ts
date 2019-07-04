import { DialogConfiguration } from '../dialog/dialog.model';

export interface CommentDialogConfiguration extends DialogConfiguration {
    commentTitle: string;
    commentPlaceHolder?: string;
    maxCommentLength: number;
    visibleCommentLines: number;
}
