import { NRLMainAction } from './nrl/state/nrl.actions';
import { NRLState, NRLReducer } from './nrl/state/nrl.reducer';
import { ActionReducerMap } from '@ngrx/store';
import { DialogState, dialogReducer } from './dialog/state/dialog.reducer';
import { DialogAction } from './dialog/state/dialog.actions';
import { DialogEffects } from './dialog/dialog.effects';
import { NavigateEffects } from './navigate/navigate.effects';

type SharedState = DialogState & NRLState;
type SharedReducerAction = DialogAction | NRLMainAction;

export const sharedReducerMap: ActionReducerMap<SharedState, SharedReducerAction> = {
    dialogData: dialogReducer,
    nrls: NRLReducer
};
export const sharedEffects = [
    DialogEffects, NavigateEffects
];
