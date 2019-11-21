import { createFeatureSelector } from '@ngrx/store';
import { UserMainState } from './state/user.reducer';

export const USER_SLICE_NAME = 'user';

export interface UserSlice<T> {
    [USER_SLICE_NAME]: T;
}

export interface UserMainSlice extends UserSlice<UserMainState> {}

export function selectUserSlice<T>() {
    return createFeatureSelector<UserSlice<T>, T>(USER_SLICE_NAME);
}
