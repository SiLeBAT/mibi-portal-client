import { createSelector } from '@ngrx/store';
import { selectMainSlice } from '../main.state';
import { MainState } from './main.reducer';

export const selectMainState = selectMainSlice<MainState>();

export const selectActionBarConfig = createSelector(
    selectMainState,
    state => state.actionBar
);

export const selectActionBarEnabled = createSelector(
    selectActionBarConfig,
    config => config.isEnabled
);

export const selectActionBarTitle = createSelector(
    selectActionBarConfig,
    config => config.title
);

export const selectActionBarItems = createSelector(
    selectActionBarConfig,
    config => config.items
);
