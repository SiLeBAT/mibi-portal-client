import { ContentMainState } from './state/content.reducer';
import { MemoizedSelector } from '@ngrx/store';
import { createSliceSelector } from '../shared/model/state-slice';

export const CONTENT_SLICE_NAME = 'content';

export interface ContentSlice<T> {
    [CONTENT_SLICE_NAME]: T;
}

export type ContentMainSlice = ContentSlice<ContentMainState>;

export function selectContentSlice<T>(): MemoizedSelector<ContentSlice<T>, T> {
    return createSliceSelector<ContentSlice<T>, T>(CONTENT_SLICE_NAME);
}
