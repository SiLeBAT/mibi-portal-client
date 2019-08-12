
import { CoreMainAction, CoreMainActionTypes } from './core.actions';
import { SamplesMainActionTypes, SamplesMainAction } from '../../samples/state/samples.actions';
import { Alert, Banner } from '../model/alert.model';
import { UserMainActionTypes, UserMainAction } from '../../user/state/user.actions';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { UserActionType } from '../../shared/model/user-action.model';
import { ValidateSamplesActionTypes, ValidateSamplesAction } from '../../samples/validate-samples/validate-samples.actions';

// STATE

export interface CoreMainState {
    ui: UIData;
}

export interface BannerData {
    show?: boolean;
    predefined: string;
    custom?: Banner;
    id?: string;
}

export interface UIData {
    isBusy: boolean;
    banner: BannerData | null;
    snackbar: Alert | null;
    enabledActionItems: UserActionType[];
}

const initialUIData: UIData = {
    isBusy: false,
    banner: null,
    snackbar: null,
    enabledActionItems: []
};

// REDUCER

type coreUIReducerAction = CoreMainAction | ValidateSamplesAction | SamplesMainAction | UserMainAction | RouterNavigationAction;

export function coreUIReducer(state: UIData = initialUIData, action: coreUIReducerAction): UIData {
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
        case UserMainActionTypes.LoginUser:
            return { ...state, isBusy: true };
        case SamplesMainActionTypes.ImportExcelFileSuccess:
        case ValidateSamplesActionTypes.ValidateSamplesSuccess:
        case UserMainActionTypes.LoginUserSuccess:
            return { ...state, isBusy: false, banner: null };
        case CoreMainActionTypes.DisplayBanner:
            return { ...state, isBusy: false, banner: action.payload };
        default:
            return state;
    }
}
