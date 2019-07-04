import { createSelector } from '@ngrx/store';
import { selectCoreSlice } from '../core.state';
import { CoreMainStates } from './core.state';

export const selectCoreMainStates = selectCoreSlice<CoreMainStates>();

export const selectUIState = createSelector(selectCoreMainStates, state => state.ui);

export const isBusy = createSelector(selectUIState, state => state.isBusy);

export const getBanner = createSelector(selectUIState, state => state.banner);

export const showBanner = createSelector(selectUIState, state => !!state.banner && !!state.banner.show);

export const getSnackbar = createSelector(selectUIState, state => state.snackbar);

export const getEnabledActionItems = createSelector(selectUIState, state => state.enabledActionItems);
