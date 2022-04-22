import { createFeatureSelector } from '@ngrx/store';
import { SamplesMainState } from './state/samples.reducer';

export const SAMPLES_SLICE_NAME = 'samples';

export interface SamplesSlice<T> {
    [SAMPLES_SLICE_NAME]: T;
}

export type SamplesMainSlice = SamplesSlice<SamplesMainState>;

export function selectSamplesSlice<T>() {
    return createFeatureSelector<SamplesSlice<T>, T>(SAMPLES_SLICE_NAME);
}
