import { createFeatureSelector } from '@ngrx/store';
import { MainState } from './state/main.reducer';

export const MAIN_SLICE_NAME = 'main';

export interface MainSlice<T> {
    [MAIN_SLICE_NAME]: T;
}

export type MainMainSlice = MainSlice<MainState>;

export function selectMainSlice<T>() {
    return createFeatureSelector<MainSlice<T>, T>(MAIN_SLICE_NAME);
}
