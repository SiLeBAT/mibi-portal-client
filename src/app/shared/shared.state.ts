import { createFeatureSelector, createSelector } from '@ngrx/store';

export const SHARED_SLICE_NAME = 'shared';

export interface SharedSlice<T> {
    [SHARED_SLICE_NAME]: T;
}

export function selectSharedSlice<T>() {
    return createFeatureSelector<SharedSlice<T>, T>(SHARED_SLICE_NAME);
}
