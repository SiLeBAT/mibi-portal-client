
import { CoreMainAction, CoreMainActionTypes } from './core.actions';
import { Banner } from '../model/alert.model';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { UserActionType } from '../../shared/model/user-action.model';
import * as _ from 'lodash';

// STATE

export interface CoreMainState {
    actionBarConfig: CoreActionBarConfig;
    isBusy: boolean;
    banner: BannerData | null;
}

export interface CoreActionBarConfig {
    isEnabled: boolean;
    enabledActions: UserActionType[];
    title: string;
}

export interface BannerData {
    show?: boolean;
    predefined: string;
    custom?: Banner;
    id?: string;
}

const initialActionBarConfig: CoreActionBarConfig = {
    isEnabled: false,
    enabledActions: [],
    title: ''
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

export function coreBannerReducer(state: BannerData | null = null, action: CoreMainAction | RouterNavigationAction): BannerData | null {
    switch (action.type) {
        case CoreMainActionTypes.DestroyBannerSOA:
            return null;
        case CoreMainActionTypes.HideBannerSOA:
            if (state) {
                const newState = _.cloneDeep(state);
                newState.show = false;
                return newState;
            }
            return state;
        case ROUTER_NAVIGATION:
            return null;
        case CoreMainActionTypes.ShowBannerSOA:
            return _.cloneDeep(action.payload);
        default:
            return state;
    }
}
