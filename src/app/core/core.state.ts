import { CoreMainState } from './state/core.reducer';
import { createFeatureSelector } from '@ngrx/store';

export const CORE_SLICE_NAME = 'core';

export interface CoreSlice<T> {
    [CORE_SLICE_NAME]: T;
}

export interface CoreMainSlice extends CoreSlice<CoreMainState> {}

export function selectCoreSlice<T>() {
    return createFeatureSelector<CoreSlice<T>, T>(CORE_SLICE_NAME);
}
