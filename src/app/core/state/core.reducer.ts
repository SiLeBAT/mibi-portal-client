import {
    destroyBannerSOA,
    hideBannerSOA,
    showActionBarSOA,
    showBannerSOA,
    showCustomBannerSOA,
    updateActionBarTitleSOA,
    updateIsBusySOA
} from './core.actions';
import { Banner, BannerType } from '../model/alert.model';
import { routerNavigationAction, routerRequestAction } from '@ngrx/router-store';
import { UserActionType } from '../../shared/model/user-action.model';
import * as _ from 'lodash';
import { createReducer, on } from '@ngrx/store';

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

export const coreIsBusyReducer = createReducer(
    false,
    on(updateIsBusySOA, (state, action) => action.isBusy)
);

export const coreActionBarConfigReducer = createReducer(
    initialActionBarConfig,
    on(showActionBarSOA, (state, action) => ({
        isEnabled: true,
        title: action.title,
        enabledActions: action.enabledActions
    })),
    on(updateActionBarTitleSOA, (state, action) => ({
        ...state,
        title: action.title
    })),
    on(routerNavigationAction, state => initialActionBarConfig)
);

export const coreBannerReducer = createReducer(
    initialBanner,
    on(showBannerSOA, (state, action) => ({
        show: true,
        predefined: action.predefined
    })),
    on(showCustomBannerSOA, (state, action) => ({
        show: true,
        custom: action.banner
    })),
    on(hideBannerSOA, routerRequestAction, state => ({
        ...state,
        show: false
    })),
    on(destroyBannerSOA, state => initialBanner)
);
