import { CommandAction, ResponseAction, CommandActionType } from './command/command.actions';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { CommandStates, commandSourcesReducer, responseMetaReducer } from './command/command.state';
import { DialogStates, dialogConfigurationReducer } from './dialog/state/dialog.state';
import { DialogAction } from './dialog/state/dialog.actions';
import { CommentDialogStates, commentDialogReducer } from './comment-dialog/state/comment-dialog.state';
import { CommentDialogAction } from './comment-dialog/state/comment-dialog.actions';
import { DialogEffects } from './dialog/dialog.effects';
import { CommentDialogEffects } from './comment-dialog/comment-dialog.effects';

type SharedStates = CommandStates & DialogStates & CommentDialogStates;
type SharedReducerAction = CommandActionType | DialogAction | CommentDialogAction;

export const sharedReducerMap: ActionReducerMap<SharedStates, SharedReducerAction> = {
    commandSources: commandSourcesReducer,
    dialogConfiguration: dialogConfigurationReducer,
    commentDialog: commentDialogReducer
};
export const sharedEffects = [
    DialogEffects, CommentDialogEffects
];

export const sharedMetaReducers: MetaReducer<CommandStates, CommandActionType>[] = [responseMetaReducer];
