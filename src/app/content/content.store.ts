import { ActionReducerMap } from '@ngrx/store';
import { ContentMainState, contentMasterDataReducer } from './state/content.reducer';
import { ContentMainAction } from './state/content.actions';

type ContentState = ContentMainState;
type ContentReducerAction = ContentMainAction;

export const contentReducerMap: ActionReducerMap<ContentState, ContentReducerAction> = {
    masterData: contentMasterDataReducer
};
