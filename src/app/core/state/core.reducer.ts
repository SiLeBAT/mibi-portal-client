
import * as fromRoot from '../../state/app.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SystemActions, CoreActionTypes } from './core.actions';
import { SamplesActionTypes } from '../../samples/state/samples.actions';
import { Alert, Banner } from '../model/alert.model';
import { UserActionTypes } from '../../user/state/user.actions';
import { ROUTER_NAVIGATION } from '@ngrx/router-store';
import { UserActionType } from '../../shared/model/user-action.model';

export const STATE_SLICE_NAME = 'core';
export interface State extends fromRoot.State {
    core: CoreState;
}

export interface CoreState {
    ui: UIState;
}

export interface BannerState {
    show?: boolean;
    predefined: string;
    custom?: Banner;
    id?: string;
}
export interface UIState {
    isBusy: boolean;
    banner: BannerState | null;
    snackbar: Alert | null;
    enabledActionItems: UserActionType[];
}

const initialState: CoreState = {
    ui: {
        isBusy: false,
        banner: null,
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

export const showBanner = createSelector(
    getCoreFeatureState,
    state => !!state.ui.banner && !!state.ui.banner.show
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
        case CoreActionTypes.DestroyBanner:

            const banner = state.ui.banner;
            if (banner && !banner.show) {
                const clearedAlertState = setUI({
                    ...state.ui, ...{
                        banner: null
                    }
                }, state);
                return clearedAlertState;
            }
            return state;
        case CoreActionTypes.HideBanner:
            const hideBanner = { ...state };
            if (hideBanner.ui.banner) {
                hideBanner.ui.banner.show = false;
            }
            return hideBanner;
        case ROUTER_NAVIGATION:
            const navigatedState = { ...state };
            navigatedState.ui.enabledActionItems = [];
            if (navigatedState.ui.banner) {
                navigatedState.ui.banner = null;
            }
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
