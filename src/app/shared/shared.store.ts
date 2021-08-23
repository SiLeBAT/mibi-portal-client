import { NrlState, nrlReducer } from './nrl/state/nrl.reducer';
import { Action, ActionReducerMap } from '@ngrx/store';
import { DialogState, dialogReducer } from './dialog/state/dialog.reducer';
import { DialogEffects } from './dialog/dialog.effects';
import { NavigateEffects } from './navigate/navigate.effects';

type SharedState = DialogState & NrlState;

export const sharedReducerMap: ActionReducerMap<SharedState, Action> = {
    dialogData: dialogReducer,
    nrls: nrlReducer
};
export const sharedEffects = [
    DialogEffects, NavigateEffects
];
