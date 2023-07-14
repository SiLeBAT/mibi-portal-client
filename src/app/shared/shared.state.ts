import { createFeatureSelector } from '@ngrx/store';

export const SHARED_SLICE_NAME = 'shared';

export interface SharedSlice<T> {
    [SHARED_SLICE_NAME]: T;
}

export function selectSharedSlice<T>() {
    return createFeatureSelector< T>(SHARED_SLICE_NAME);
}
