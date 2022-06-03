import { Action, ActionReducerMap } from '@ngrx/store';
import { ContentMainState, contentMasterDataReducer } from './state/content.reducer';

type ContentState = ContentMainState;

export const contentReducerMap: ActionReducerMap<ContentState, Action> = {
    masterData: contentMasterDataReducer
};
