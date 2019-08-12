import { createSelector } from '@ngrx/store';
import { selectCoreSlice } from '../core.state';
import { CoreMainState } from './core.reducer';

export const selectCoreMainState = selectCoreSlice<CoreMainState>();

export const selectUIData = createSelector(selectCoreMainState, state => state.ui);

export const selectIsBusy = createSelector(selectUIData, state => state.isBusy);

export const selectBannerData = createSelector(selectUIData, state => state.banner);

export const selectIsBannerShown = createSelector(selectUIData, state => !!state.banner && !!state.banner.show);

export const selectSnackbar = createSelector(selectUIData, state => state.snackbar);

export const selectEnabledActionItems = createSelector(selectUIData, state => state.enabledActionItems);
