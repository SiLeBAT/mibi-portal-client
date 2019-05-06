import { createFeatureSelector, createSelector } from '@ngrx/store';

export const SHARED_SLICE_NAME = 'shared';

export interface SharedSlice<T> {
    [SHARED_SLICE_NAME]: T;
}

// export function selectFromSharedSlice<T>(key: keyof T) {
//     const selectShared = createFeatureSelector<SharedSlice<T>, T>(SHARED_SLICE_NAME);
//     return createSelector(selectShared, state => state[key]);
// }

export function selectSharedSlice<T>() {
    return createFeatureSelector<SharedSlice<T>, T>(SHARED_SLICE_NAME);
}
