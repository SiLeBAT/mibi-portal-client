
import * as fromRoot from '../../state/app.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SystemActions, CoreActionTypes } from './core.actions';
import { SamplesActionTypes } from '../../samples/state/samples.actions';
import { Alert, Banner } from '../model/alert.model';
import { UserActionTypes } from '../../user/state/user.actions';
import { ROUTER_NAVIGATION } from '@ngrx/router-store';
import { ActionItemType } from '../model/action-items.model';

export const STATE_SLICE_NAME = 'core';
export interface State extends fromRoot.State {
    core: CoreState;
}

export interface CoreState {
    ui: UIState;
}

export interface BannerState {
    predefined: string;
    custom?: Banner;
}
export interface UIState {
    isBusy: boolean;
    banner: BannerState | null;
    snackbar: Alert | null;
    enabledActionItems: ActionItemType[];
}

const initialState: CoreState = {
    ui: {
        isBusy: false,
        banner: null, // { predefined: 'loginUnauthorized' },
        snackbar: null,
        enabledActionItems: []
    }
};

// SELECTORS
export const getCoreFeatureState = createFeatureSelector<CoreState>(STATE_SLICE_NAME);

export const isBusy = createSelector(
    getCoreFeatureState,
    state => state.ui.isBusy
);

export const getBanner = createSelector(
    getCoreFeatureState,
    state => state.ui.banner
);

export const getSnackbar = createSelector(
    getCoreFeatureState,
    state => state.ui.snackbar
);

export const getEnabledActionItems = createSelector(
    getCoreFeatureState,
    state => state.ui.enabledActionItems
);

// REDUCER
export function reducer(state: CoreState = initialState, action: SystemActions): CoreState {
    switch (action.type) {
        case CoreActionTypes.EnableActionItems:
            const enabledAIState = { ...state };
            enabledAIState.ui.enabledActionItems = action.payload;
            return enabledAIState;
        case CoreActionTypes.ClearBanner:
            const clearedAlertState = setUI({
                ...state.ui, ...{
                    banner: null
                }
            }, state);
            return clearedAlertState;
        case ROUTER_NAVIGATION:
            const navigatedState = { ...state };
            navigatedState.ui.enabledActionItems = [];
            return navigatedState;
        case SamplesActionTypes.ValidateSamples:
        case SamplesActionTypes.ImportExcelFile:
        case UserActionTypes.LoginUser:
            return setUI({
                ...state.ui, ...{
                    isBusy: true
                }
            }, state);
        case SamplesActionTypes.ImportExcelFileSuccess:
        case SamplesActionTypes.ValidateSamplesSuccess:
        case UserActionTypes.LoginUserSuccess:
            return setUI({
                ...state.ui, ...{
                    isBusy: false,
                    banner: null
                }
            }, state);
        case CoreActionTypes.DisplayBanner:
            return {
                ...state, ...{
                    ui: {
                        ...state.ui, ...{
                            isBusy: false,
                            banner: action.payload
                        }
                    }
                }
            };
        default:
            return state;
    }
}

// Utility

function setUI(ui: UIState, state: CoreState) {
    const newState = { ...state };
    newState.ui = ui;
    return newState;
}
