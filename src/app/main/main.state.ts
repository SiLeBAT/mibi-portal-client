import { createFeatureSelector } from '@ngrx/store';

export const MAIN_SLICE_NAME = 'main';

export interface MainSlice<T> {
    [MAIN_SLICE_NAME]: T;
}

export function selectMainSlice<T>() {
    return createFeatureSelector<MainSlice<T>, T>(MAIN_SLICE_NAME);
}
