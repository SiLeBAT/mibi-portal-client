import { ActionReducerMap } from '@ngrx/store';
import { DialogStates, dialogConfigurationReducer } from './dialog/store/dialog.state';
import { DialogAction } from './dialog/store/dialog.actions';
import { CoreMainStates, coreUIReducer } from './state/core.reducer';
import { CoreMainAction } from './state/core.actions';
import { ValidateSamplesAction } from '../samples/validate-samples/store/validate-samples.actions';
import { DialogEffects } from './dialog/store/dialog.effects';
import { CoreMainEffects } from './state/core.effects';

type CoreStates = CoreMainStates & DialogStates;
type CoreReducerAction = CoreMainAction | DialogAction | ValidateSamplesAction;

export const coreReducerMap: ActionReducerMap<CoreStates, CoreReducerAction> = {
    ui: coreUIReducer,
    dialogConfiguration: dialogConfigurationReducer
};

export const coreEffects = [
    CoreMainEffects, DialogEffects
];
