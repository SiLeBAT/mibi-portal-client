import { ActionReducerMap } from '@ngrx/store';
import { ContentMainStates, contentMasterDataReducer } from './state/content.reducer';
import { ContentMainAction } from './state/content.actions';
import { ValidateSamplesAction } from '../samples/validate-samples/state/validate-samples.actions';

type ContentStates = ContentMainStates;
type ContentReducerAction = ContentMainAction | ValidateSamplesAction;

export const contentReducerMap: ActionReducerMap<ContentStates, ContentReducerAction> = {
    masterData: contentMasterDataReducer
};
