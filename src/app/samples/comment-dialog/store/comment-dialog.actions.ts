import { Action } from '@ngrx/store';
import { CommandAction, ResponseAction } from '../../../shared/command/command.actions';
import { CommentDialogConfiguration } from '../model/comment-dialog-config.model';

export enum CommentDialogActionTypes {
    CommentDialogOpen = '[Samples/CommentDialog] Open input dialog',
    CommentDialogConfirm = '[Samples/CommentDialog] Confirm clicked',
    CommentDialogCancel = '[Samples/CommentDialog] Cancel clicked'
}

export class CommentDialogOpen implements CommandAction {
    readonly type = CommentDialogActionTypes.CommentDialogOpen;

    constructor(public source: string, public payload: { configuration: CommentDialogConfiguration }) { }
}

export class CommentDialogConfirm implements ResponseAction {
    readonly type = CommentDialogActionTypes.CommentDialogConfirm;
    readonly command = CommentDialogActionTypes.CommentDialogOpen;

    constructor(public payload: { comment: string }) { }
}

export class CommentDialogCancel implements ResponseAction {
    readonly type = CommentDialogActionTypes.CommentDialogCancel;
    readonly command = CommentDialogActionTypes.CommentDialogOpen;
}

export type CommentDialogAction =
    CommentDialogOpen
    | CommentDialogConfirm
    | CommentDialogCancel;
