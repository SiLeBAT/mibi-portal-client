import { ActionReducerMap } from '@ngrx/store';
import { DialogState, dialogReducer } from './dialog/state/dialog.reducer';
import { DialogAction } from './dialog/state/dialog.actions';
import { DialogEffects } from './dialog/dialog.effects';

type SharedState = DialogState;
type SharedReducerAction = DialogAction;

export const sharedReducerMap: ActionReducerMap<SharedState, SharedReducerAction> = {
    dialogData: dialogReducer
};
export const sharedEffects = [
    DialogEffects
];
