import { createFeatureSelector, createSelector } from '@ngrx/store';

export const SAMPLES_SLICE_NAME = 'samples';

export interface SamplesSlice<T> {
    [SAMPLES_SLICE_NAME]: T;
}

// export function selectFromSamplesSlice<T>(key: keyof T) {
//     const selectSamples = createFeatureSelector<SamplesSlice<T>, T>(SAMPLES_SLICE_NAME);
//     return createSelector(selectSamples, state => state[key]);
// }

export function selectSamplesSlice<T>() {
    return createFeatureSelector<SamplesSlice<T>, T>(SAMPLES_SLICE_NAME);
}
