import { createSelector } from '@ngrx/store';
import { selectCoreSlice } from '../core.state';
import { CoreMainState } from './core.reducer';

export const selectCoreMainState = selectCoreSlice<CoreMainState>();

export const selectIsBusy = createSelector(selectCoreMainState, state => state.isBusy);

export const selectBannerData = createSelector(selectCoreMainState, state => state.banner);
export const selectIsBannerShown = createSelector(selectBannerData, state => state.show);

export const selectActionBarConfig = createSelector(selectCoreMainState, state => state.actionBarConfig);
export const selectActionBarEnabled = createSelector(selectActionBarConfig, state => state.isEnabled);
export const selectActionBarTitle = createSelector(selectActionBarConfig, state => state.title);
export const selectActionBarEnabledActions = createSelector(selectActionBarConfig, state => state.enabledActions);
