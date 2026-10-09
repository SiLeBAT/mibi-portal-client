import {
    destroyBannerSOA,
    hideBannerSOA,
    showBannerSOA,
    showCustomBannerSOA,
    updateClientDashboardInfoSOA,
    updateZomoPlanFilesSOA,
    updateIsBusySOA,
    updateWelcomePageSOA
} from './core.actions';
import { Banner, BannerType } from '../model/alert.model';
import { routerRequestAction } from '@ngrx/router-store';
import { createReducer, on } from '@ngrx/store';
import { ZomoPlanFileInfo } from '../model/response.model';

// STATE

export interface WelcomePageState {
    isMaintenance: boolean;
    content: string;
}

export interface CoreMainState {
    isBusy: boolean;
    banner: BannerData;
    alternativeWelcomePage: boolean;
    zomoPlanFiles: ZomoPlanFileInfo[];
    welcomePage: WelcomePageState;
}

export interface BannerData {
    show: boolean;
    predefined?: BannerType;
    custom?: Banner;
}

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

export const coreZomoPlanFilesReducer = createReducer<ZomoPlanFileInfo[]>(
    [],
    on(updateZomoPlanFilesSOA, (_state, action) => action.zomoPlanFiles)
);

export const coreWelcomePageReducer = createReducer<WelcomePageState>(
    { isMaintenance: false, content: '' },
    on(updateWelcomePageSOA, (_state, action) => ({
        isMaintenance: action.isMaintenance,
        content: action.content
    }))
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
