import { MemoizedSelector } from '@ngrx/store';
import { createSliceSelector } from '../shared/model/state-slice';
import { MainState } from './state/main.reducer';

export const MAIN_SLICE_NAME = 'main';

export interface MainSlice<T> {
    [MAIN_SLICE_NAME]: T;
}

export type MainMainSlice = MainSlice<MainState>;

export function selectMainSlice<T>(): MemoizedSelector<MainSlice<T>, T> {
    return createSliceSelector<MainSlice<T>, T>(MAIN_SLICE_NAME);
}
