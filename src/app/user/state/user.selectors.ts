import { createSelector } from '@ngrx/store';
import { UserMainState } from './user.reducer';
import { selectUserSlice } from '../user.state';

export const selectUserMainState = selectUserSlice<UserMainState>();

export const selectUserCurrentUser = createSelector(selectUserMainState, state => state.currentUser);

export const selectUserInstitutions = createSelector(selectUserMainState, state => state.institutes);
