import { MemoizedSelector } from '@ngrx/store';
import { createSliceSelector } from './model/state-slice';

export const SHARED_SLICE_NAME = 'shared';

export interface SharedSlice<T> {
    [SHARED_SLICE_NAME]: T;
}

export function selectSharedSlice<T>(): MemoizedSelector<SharedSlice<T>, T> {
    return createSliceSelector<SharedSlice<T>, T>(SHARED_SLICE_NAME);
}
