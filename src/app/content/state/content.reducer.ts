
import { ContentMainAction, ContentMainActionTypes } from './content.actions';

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

export function contentMasterDataReducer(
    state: MasterData = initialMasterData,
    action: ContentMainAction
): MasterData {
    switch (action.type) {
        case ContentMainActionTypes.UpdateSupportDetail:
            return { ...state, supportContact: action.payload.supportContact };
        default:
            return state;
    }
}
