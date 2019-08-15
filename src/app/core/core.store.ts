import { ActionReducerMap } from '@ngrx/store';
import { CoreMainState, coreIsBusyReducer, coreActionItemsReducer, coreBannerReducer } from './state/core.reducer';
import { CoreMainAction } from './state/core.actions';
import { CoreMainEffects } from './core.effects';
import { RouterNavigationAction } from '@ngrx/router-store';

type CoreState = CoreMainState;
type CoreReducerAction = CoreMainAction | RouterNavigationAction;

export const coreReducerMap: ActionReducerMap<CoreState, CoreReducerAction> = {
    isBusy: coreIsBusyReducer,
    enabledActionItems: coreActionItemsReducer,
    banner: coreBannerReducer
};

export const coreEffects = [
    CoreMainEffects
];
