import { Action, ActionReducerMap } from '@ngrx/store';
import {
    CoreMainState,
    coreIsBusyReducer,
    coreActionBarConfigReducer,
    coreBannerReducer,
    coreIsAlternativeWelcomePageReducer
} from './state/core.reducer';
import { CoreMainEffects } from './core.effects';

type CoreState = CoreMainState;

export const coreReducerMap: ActionReducerMap<CoreState, Action> = {
    actionBarConfig: coreActionBarConfigReducer,
    isBusy: coreIsBusyReducer,
    banner: coreBannerReducer,
    alternativeWelcomePage: coreIsAlternativeWelcomePageReducer
};

export const coreEffects = [
    CoreMainEffects
];
