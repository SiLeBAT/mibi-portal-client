import {
    destroyBannerSOA,
    hideBannerSOA,
    showActionBarSOA,
    showBannerSOA,
    showCustomBannerSOA,
    updateActionBarTitleSOA,
    updateClientDashboardInfoSOA,
    updateZomoPlanFilesSOA,
    updateIsBusySOA
} from './core.actions';
import { Banner, BannerType } from '../model/alert.model';
import { routerNavigationAction, routerRequestAction } from '@ngrx/router-store';
import { UserActionType } from '../../shared/model/user-action.model';
import { createReducer, on } from '@ngrx/store';
import { ZomoPlanFile } from '../model/response.model';

// STATE

export interface CoreMainState {
    actionBarConfig: CoreActionBarConfig;
    isBusy: boolean;
    banner: BannerData;
    alternativeWelcomePage: boolean;
    zomoPlanFiles: ZomoPlanFile[];
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
    on(updateIsBusySOA, (_state, action) => action.isBusy)
);

export const coreIsAlternativeWelcomePageReducer = createReducer(
    false,
    on(updateClientDashboardInfoSOA, (_state, action) => action.alternativeWelcomePage)
);

export const coreZomoPlanFilesReducer = createReducer<ZomoPlanFile[]>(
    [],
    on(updateZomoPlanFilesSOA, (_state, action) => action.zomoPlanFiles)
);

export const coreActionBarConfigReducer = createReducer(
    initialActionBarConfig,
    on(showActionBarSOA, (_state, action) => ({
        isEnabled: true,
        title: action.title,
        enabledActions: action.enabledActions
    })),
    on(updateActionBarTitleSOA, (state, action) => ({
        ...state,
        title: action.title
    })),
    on(routerNavigationAction, _state => initialActionBarConfig)
);

export const coreBannerReducer = createReducer(
    initialBanner,
    on(showBannerSOA, (_state, action) => ({
        show: true,
        predefined: action.predefined
    })),
    on(showCustomBannerSOA, (_state, action) => ({
        show: true,
        custom: action.banner
    })),
    on(hideBannerSOA, routerRequestAction, state => ({
        ...state,
        show: false
    })),
    on(destroyBannerSOA, _state => initialBanner)
);
