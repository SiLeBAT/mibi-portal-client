import { MemoizedSelector } from '@ngrx/store';
import { createSliceSelector } from '../shared/model/state-slice';
import { UserMainState } from './state/user.reducer';

export const USER_SLICE_NAME = 'user';

export interface UserSlice<T> {
    [USER_SLICE_NAME]: T;
}

export type UserMainSlice = UserSlice<UserMainState>;

export function selectUserSlice<T>(): MemoizedSelector<UserSlice<T>, T> {
    return createSliceSelector<UserSlice<T>, T>(USER_SLICE_NAME);
}
