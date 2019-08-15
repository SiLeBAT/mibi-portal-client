import { MultiTargetAction } from '../../ngrx/multi-target-action';
import { CommentDialogConfiguration } from '../comment-dialog.model';

export enum CommentDialogActionTypes {
    CommentDialogOpenMTA = '[Shared/CommentDialog] Open comment dialog',
    CommentDialogConfirmMTA = '[Shared/CommentDialog] Inform of comment dialog confirmed',
    CommentDialogCancelMTA = '[Shared/CommentDialog] Inform of comment dialog cancelled'
}

export class CommentDialogOpenMTA implements MultiTargetAction {
    readonly type = CommentDialogActionTypes.CommentDialogOpenMTA;

    constructor(public target: string, public payload: { configuration: CommentDialogConfiguration }) { }
}

export class CommentDialogConfirmMTA implements MultiTargetAction {
    readonly type = CommentDialogActionTypes.CommentDialogConfirmMTA;

    constructor(public target: string, public payload: { comment: string }) { }
}

export class CommentDialogCancelMTA implements MultiTargetAction {
    readonly type = CommentDialogActionTypes.CommentDialogCancelMTA;

    constructor(public target: string) { }
}

export type CommentDialogAction =
    CommentDialogOpenMTA
    | CommentDialogConfirmMTA
    | CommentDialogCancelMTA;
