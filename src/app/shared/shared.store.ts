import { CommandActionType } from './command/command.actions';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { CommandState, commandSourcesReducer, responseMetaReducer } from './command/command.reducer';
import { DialogState, dialogConfigurationReducer } from './dialog/state/dialog.reducer';
import { DialogAction } from './dialog/state/dialog.actions';
import { CommentDialogState, commentDialogReducer } from './comment-dialog/state/comment-dialog.reducer';
import { CommentDialogAction } from './comment-dialog/state/comment-dialog.actions';
import { DialogEffects } from './dialog/dialog.effects';
import { CommentDialogEffects } from './comment-dialog/comment-dialog.effects';

type SharedState = CommandState & DialogState & CommentDialogState;
type SharedReducerAction = CommandActionType | DialogAction | CommentDialogAction;

export const sharedReducerMap: ActionReducerMap<SharedState, SharedReducerAction> = {
    commandSources: commandSourcesReducer,
    dialogConfiguration: dialogConfigurationReducer,
    commentDialog: commentDialogReducer
};
export const sharedEffects = [
    DialogEffects, CommentDialogEffects
];

export const sharedMetaReducers: MetaReducer<CommandState, CommandActionType>[] = [responseMetaReducer];
