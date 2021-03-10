import { createSelector } from '@ngrx/store';
import { UserMainState } from './user.reducer';
import { selectUserSlice } from '../user.state';

export const selectUserMainState = selectUserSlice<UserMainState>();

export const selectCurrentUser = createSelector(selectUserMainState, state => state.currentUser);

export const selectInstitutions = createSelector(selectUserMainState, state => state.institutes);

export const selectUserState = createSelector(selectUserMainState, state => state.state);

export const selectAuthInfo = createSelector(selectCurrentUser, selectUserState, (currentUser, state) => ({
    currentUser,
    state
}));
