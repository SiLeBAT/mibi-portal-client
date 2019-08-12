import { ActionReducerMap } from '@ngrx/store';
import { CoreMainState, coreUIReducer } from './state/core.reducer';
import { CoreMainAction } from './state/core.actions';
import { ValidateSamplesAction } from '../samples/validate-samples/validate-samples.actions';
import { CoreMainEffects } from './core.effects';

type CoreState = CoreMainState;
type CoreReducerAction = CoreMainAction | ValidateSamplesAction;

export const coreReducerMap: ActionReducerMap<CoreState, CoreReducerAction> = {
    ui: coreUIReducer
};

export const coreEffects = [
    CoreMainEffects
];
