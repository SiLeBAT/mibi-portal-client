import { createReducer, on } from '@ngrx/store';
import { updateSupportDetailSOA } from './content.actions';

// STATE

export interface ContentMainState {
    masterData: MasterData;
}

export interface MasterData {
    supportContact: string;
}

const initialMasterData: MasterData = {
    supportContact: ''
};

// REDUCER

export const contentMasterDataReducer = createReducer(
    initialMasterData,
    on(updateSupportDetailSOA, (state, action) => ({
        ...state,
        supportContact: action.supportDetail.supportContact
    }))
);
