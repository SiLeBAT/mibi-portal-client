import { ContentMainState } from './state/content.reducer';
import { createFeatureSelector } from '@ngrx/store';

export const CONTENT_SLICE_NAME = 'content';

export interface ContentSlice<T> {
    [CONTENT_SLICE_NAME]: T;
}

export type ContentMainSlice = ContentSlice<ContentMainState>;

export function selectContentSlice<T>() {
    return createFeatureSelector< T>(CONTENT_SLICE_NAME);
}
