import { CoreMainState } from './state/core.reducer';
import { MemoizedSelector } from '@ngrx/store';
import { createSliceSelector } from '../shared/model/state-slice';

export const CORE_SLICE_NAME = 'core';

export interface CoreSlice<T> {
    [CORE_SLICE_NAME]: T;
}

export type CoreMainSlice = CoreSlice<CoreMainState>;

export function selectCoreSlice<T>(): MemoizedSelector<CoreSlice<T>, T> {
    return createSliceSelector<CoreSlice<T>, T>(CORE_SLICE_NAME);
}
