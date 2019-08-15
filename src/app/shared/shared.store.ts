import { ActionReducerMap } from '@ngrx/store';
import { DialogState, dialogReducer } from './dialog/state/dialog.reducer';
import { DialogAction } from './dialog/state/dialog.actions';
import { CommentDialogState, commentDialogReducer } from './comment-dialog/state/comment-dialog.reducer';
import { CommentDialogAction } from './comment-dialog/state/comment-dialog.actions';
import { DialogEffects } from './dialog/dialog.effects';
import { CommentDialogEffects } from './comment-dialog/comment-dialog.effects';

type SharedState = DialogState & CommentDialogState;
type SharedReducerAction = DialogAction | CommentDialogAction;

export const sharedReducerMap: ActionReducerMap<SharedState, SharedReducerAction> = {
    dialogData: dialogReducer,
    commentDialogData: commentDialogReducer
};
export const sharedEffects = [
    DialogEffects, CommentDialogEffects
];
