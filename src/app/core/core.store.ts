import { Action, ActionReducerMap } from '@ngrx/store';
import { CoreMainState, coreIsBusyReducer, coreActionBarConfigReducer, coreBannerReducer } from './state/core.reducer';
import { CoreMainEffects } from './core.effects';

type CoreState = CoreMainState;

export const coreReducerMap: ActionReducerMap<CoreState, Action> = {
    actionBarConfig: coreActionBarConfigReducer,
    isBusy: coreIsBusyReducer,
    banner: coreBannerReducer
};

export const coreEffects = [
    CoreMainEffects
];
