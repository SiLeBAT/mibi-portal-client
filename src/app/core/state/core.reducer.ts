
import { CoreMainAction, CoreMainActionTypes } from './core.actions';
import { Banner, BannerType } from '../model/alert.model';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { UserActionType } from '../../shared/model/user-action.model';
import * as _ from 'lodash';

// STATE

export interface CoreMainState {
    actionBarConfig: CoreActionBarConfig;
    isBusy: boolean;
    banner: BannerData;
}

export interface CoreActionBarConfig {
    isEnabled: boolean;
    enabledActions: UserActionType[];
    title: string;
}

export interface BannerData {
    show: boolean;
    predefined?: BannerType;
    custom?: Banner;
}

const initialActionBarConfig: CoreActionBarConfig = {
    isEnabled: false,
    enabledActions: [],
    title: ''
};

const initialBanner: BannerData = {
    show: false
};

// REDUCER

export function coreIsBusyReducer(state: boolean = false, action: CoreMainAction): boolean {
    switch (action.type) {
        case CoreMainActionTypes.UpdateIsBusySOA:
            return action.payload.isBusy;
        default:
            return state;
    }
}

export function coreActionBarConfigReducer(
    state: CoreActionBarConfig = initialActionBarConfig,
    action: CoreMainAction | RouterNavigationAction
): CoreActionBarConfig {
    switch (action.type) {
        case CoreMainActionTypes.ShowActionBarSOA:
            return {
                isEnabled: true,
                title: action.payload.title,
                enabledActions: action.payload.enabledActions
            };
        case CoreMainActionTypes.UpdateActionBarTitleSOA:
            return {
                ...state,
                title: action.payload.title
            };
        case ROUTER_NAVIGATION:
            return initialActionBarConfig;
        default:
            return state;
    }
}

export function coreBannerReducer(state: BannerData = initialBanner, action: CoreMainAction | RouterNavigationAction): BannerData {
    switch (action.type) {
        case CoreMainActionTypes.ShowBannerSOA:
            return {
                show: true,
                predefined: action.payload.predefined
            };
        case CoreMainActionTypes.ShowCustomBannerSOA:
            return {
                show: true,
                custom: action.payload.banner
            };
        case CoreMainActionTypes.HideBannerSOA:
        case ROUTER_NAVIGATION:
            return { ...state, show: false };
        case CoreMainActionTypes.DestroyBannerSOA:
            return initialBanner;
        default:
            return state;
    }
}
