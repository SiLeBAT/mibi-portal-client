
import * as fromRoot from '../../state/app.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CoreMainAction, CoreMainActionTypes } from './core.actions';
import { SamplesMainActionTypes } from '../../samples/state/samples.actions';
import { Alert, Banner } from '../model/alert.model';
import { UserActionTypes } from '../../user/state/user.actions';
import { ROUTER_NAVIGATION } from '@ngrx/router-store';
import { UserActionType } from '../../shared/model/user-action.model';
import { ValidateSamplesActionTypes, ValidateSamplesAction } from '../../samples/validate-samples/store/validate-samples.actions';
import { selectCoreSlice } from '../core.state';

export interface CoreMainStates {
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

const initialUIState: UIState = {
    isBusy: false,
    banner: null,
    snackbar: null,
    enabledActionItems: []
};

// SELECTORS

export const selectCoreMainStates = selectCoreSlice<CoreMainStates>();

export const selectUIState = createSelector(
    selectCoreMainStates,
    state => state.ui
);

export const isBusy = createSelector(
    selectUIState,
    state => state.isBusy
);

export const getBanner = createSelector(
    selectUIState,
    state => state.banner
);

export const showBanner = createSelector(
    selectUIState,
    state => !!state.banner && !!state.banner.show
);

export const getSnackbar = createSelector(
    selectUIState,
    state => state.snackbar
);

export const getEnabledActionItems = createSelector(
    selectUIState,
    state => state.enabledActionItems
);

// REDUCER
export function coreUIReducer(state: UIState = initialUIState, action: CoreMainAction | ValidateSamplesAction): UIState {
    switch (action.type) {
        case CoreMainActionTypes.EnableActionItems:
            const enabledAIState = { ...state };
            enabledAIState.enabledActionItems = action.payload;
            return enabledAIState;
        case CoreMainActionTypes.DestroyBanner:

            const banner = state.banner;
            if (banner && !banner.show) {
                const clearedAlertState = { ...state, banner: null };
                return clearedAlertState;
            }
            return state;
        case CoreMainActionTypes.HideBanner:
            const hideBanner = { ...state };
            if (hideBanner.banner) { hideBanner.banner.show = false; }
            return hideBanner;
        case ROUTER_NAVIGATION:
            const navigatedState = { ...state };
            navigatedState.enabledActionItems = [];
            if (navigatedState.banner) {
                navigatedState.banner = null;
            }
            return navigatedState;
        case ValidateSamplesActionTypes.ValidateSamples:
        case SamplesMainActionTypes.ImportExcelFile:
        case UserActionTypes.LoginUser:
            return { ...state, isBusy: true };
        case SamplesMainActionTypes.ImportExcelFileSuccess:
        case ValidateSamplesActionTypes.ValidateSamplesSuccess:
        case UserActionTypes.LoginUserSuccess:
            return { ...state, isBusy: false, banner: null };
        case CoreMainActionTypes.DisplayBanner:
            return { ...state, isBusy: false, banner: action.payload };
        default:
            return state;
    }
}
