import { MemoizedSelector } from '@ngrx/store';
import { createSliceSelector } from '../shared/model/state-slice';
import { SamplesMainState } from './state/samples.reducer';

export const SAMPLES_SLICE_NAME = 'samples';

export interface SamplesSlice<T> {
    [SAMPLES_SLICE_NAME]: T;
}

export type SamplesMainSlice = SamplesSlice<SamplesMainState>;

export function selectSamplesSlice<T>(): MemoizedSelector<SamplesSlice<T>, T> {
    return createSliceSelector<SamplesSlice<T>, T>(SAMPLES_SLICE_NAME);
}
