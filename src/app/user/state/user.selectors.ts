import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState, STATE_SLICE_NAME } from './user.state';

export const getUserFeatureState = createFeatureSelector<UserState>(STATE_SLICE_NAME);

export const selectCurrentUser = createSelector(getUserFeatureState, state => state.currentUser);

export const selectInstitutions = createSelector(getUserFeatureState, state => state.institutes);
