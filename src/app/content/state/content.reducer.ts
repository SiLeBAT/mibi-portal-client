
import { createSelector, MemoizedSelector } from '@ngrx/store';
import { ContentMainAction, ContentMainActionTypes } from './content.actions';
import { selectContentSlice, ContentSlice } from '../content.state';

export interface ContentMainStates {
    masterData: MasterDataState;
}

export interface MasterDataState {
    supportContact: string;
}

const initialMasterDataState: MasterDataState = {
    supportContact: ''
};

// SELECTORS

export const selectContentMainStates = selectContentSlice<ContentMainStates>();

export const selectMasterDataState = createSelector(
    selectContentMainStates,
    state => state.masterData
);

export const selectSupportContact = createSelector(
    selectMasterDataState,
    state => state.supportContact
);

// REDUCER
type contentMasterDataReducerAction = ContentMainAction;

export function contentMasterDataReducer(
    state: MasterDataState = initialMasterDataState,
    action: contentMasterDataReducerAction
): MasterDataState {
    switch (action.type) {
        case ContentMainActionTypes.UpdateSupportDetail:
            return { ...state, supportContact: action.payload.supportContact };
        default:
            return state;
    }
}
