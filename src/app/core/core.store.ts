import { ActionReducerMap } from '@ngrx/store';
import { CoreMainStates, coreUIReducer } from './state/core.state';
import { CoreMainAction } from './state/core.actions';
import { ValidateSamplesAction } from '../samples/validate-samples/validate-samples.actions';
import { CoreMainEffects } from './core.effects';

type CoreStates = CoreMainStates;
type CoreReducerAction = CoreMainAction | ValidateSamplesAction;

export const coreReducerMap: ActionReducerMap<CoreStates, CoreReducerAction> = {
    ui: coreUIReducer
};

export const coreEffects = [
    CoreMainEffects
];
