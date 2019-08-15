
import { CoreMainAction, CoreMainActionTypes } from './core.actions';
import { Banner } from '../model/alert.model';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { UserActionType } from '../../shared/model/user-action.model';
import * as _ from 'lodash';

// STATE

export interface CoreMainState {
    isBusy: boolean;
    enabledActionItems: UserActionType[];
    banner: BannerData | null;
}

export interface BannerData {
    show?: boolean;
    predefined: string;
    custom?: Banner;
    id?: string;
}

// REDUCER

export function coreIsBusyReducer(state: boolean = false, action: CoreMainAction): boolean {
    switch (action.type) {
        case CoreMainActionTypes.UpdateIsBusySOA:
            return action.payload;
        default:
            return state;
    }
}

export function coreActionItemsReducer(state: UserActionType[] = [], action: CoreMainAction | RouterNavigationAction): UserActionType[] {
    switch (action.type) {
        case CoreMainActionTypes.UpdateActionItemsSOA:
            return _.cloneDeep(action.payload);
        case ROUTER_NAVIGATION:
            return [];
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
        case CoreMainActionTypes.DisplayBannerSOA:
            return _.cloneDeep(action.payload);
        default:
            return state;
    }
}
