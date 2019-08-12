import { createSelector } from '@ngrx/store';
import { UserMainState } from './user.reducer';
import { selectUserSlice } from '../user.state';

export const selectUserMainState = selectUserSlice<UserMainState>();

export const selectCurrentUser = createSelector(selectUserMainState, state => state.currentUser);

export const selectInstitutions = createSelector(selectUserMainState, state => state.institutes);
