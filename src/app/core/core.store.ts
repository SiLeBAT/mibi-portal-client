import { ActionReducerMap } from '@ngrx/store';
import { CoreMainState, coreIsBusyReducer, coreActionBarConfigReducer, coreBannerReducer } from './state/core.reducer';
import { CoreMainAction } from './state/core.actions';
import { CoreMainEffects } from './core.effects';
import { RouterNavigationAction, RouterRequestAction } from '@ngrx/router-store';

type CoreState = CoreMainState;
type CoreReducerAction = CoreMainAction | RouterNavigationAction | RouterRequestAction;

export const coreReducerMap: ActionReducerMap<CoreState, CoreReducerAction> = {
    actionBarConfig: coreActionBarConfigReducer,
    isBusy: coreIsBusyReducer,
    banner: coreBannerReducer
};

export const coreEffects = [
    CoreMainEffects
];
