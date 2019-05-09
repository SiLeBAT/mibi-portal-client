import { ActionReducerMap } from '@ngrx/store';
import { CoreMainStates, coreUIReducer } from './state/core.reducer';
import { CoreMainAction } from './state/core.actions';
import { ValidateSamplesAction } from '../samples/validate-samples/state/validate-samples.actions';
import { CoreMainEffects } from './state/core.effects';

type CoreStates = CoreMainStates;
type CoreReducerAction = CoreMainAction | ValidateSamplesAction;

export const coreReducerMap: ActionReducerMap<CoreStates, CoreReducerAction> = {
    ui: coreUIReducer
};

export const coreEffects = [
    CoreMainEffects
];
