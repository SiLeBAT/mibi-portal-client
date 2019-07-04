
import { MemoizedSelector } from '@ngrx/store';
import { ContentMainAction, ContentMainActionTypes } from './content.actions';
import { ContentSlice } from '../content.state';

// STATE

export interface ContentMainStates {
    masterData: MasterDataState;
}

export interface MasterDataState {
    supportContact: string;
}

const initialMasterDataState: MasterDataState = {
    supportContact: ''
};

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
