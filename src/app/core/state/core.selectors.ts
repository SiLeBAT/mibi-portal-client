import { createSelector } from '@ngrx/store';
import { selectCoreSlice } from '../core.state';
import { CoreMainState } from './core.reducer';

export const selectCoreMainState = selectCoreSlice<CoreMainState>();

export const selectIsBusy = createSelector(selectCoreMainState, state => state.isBusy);
export const selectIsAlternativeWelcomePage = createSelector(selectCoreMainState, state => state.alternativeWelcomePage);

export const selectBannerData = createSelector(selectCoreMainState, state => state.banner);
export const selectIsBannerShown = createSelector(selectBannerData, bannerData => bannerData.show);


export const selectZomoPlanFiles = createSelector(selectCoreMainState, state => state.zomoPlanFiles);

export const selectWelcomePage = createSelector(selectCoreMainState, state => state.welcomePage);
export const selectWelcomePageIsMaintenance = createSelector(selectWelcomePage, wp => wp.isMaintenance);
export const selectWelcomePageContent = createSelector(selectWelcomePage, wp => wp.content);
