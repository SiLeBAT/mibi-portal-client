import { ContentMainStates } from './state/content.state';
import { createFeatureSelector } from '@ngrx/store';

export const CONTENT_SLICE_NAME = 'content';

export interface ContentSlice<T> {
    [CONTENT_SLICE_NAME]: T;
}

export interface Content extends ContentSlice<ContentMainStates> {}

export function selectContentSlice<T>() {
    return createFeatureSelector<ContentSlice<T>, T>(CONTENT_SLICE_NAME);
}
