import { createSelector } from '@ngrx/store';
import { selectCoreSlice } from '../core.state';
import { CoreMainState } from './core.reducer';

export const selectCoreMainState = selectCoreSlice<CoreMainState>();

export const selectIsBusy = createSelector(selectCoreMainState, state => state.isBusy);

export const selectBannerData = createSelector(selectCoreMainState, state => state.banner);

export const selectIsBannerShown = createSelector(selectCoreMainState, state => !!state.banner && !!state.banner.show);

export const selectEnabledActionItems = createSelector(selectCoreMainState, state => state.enabledActionItems);
