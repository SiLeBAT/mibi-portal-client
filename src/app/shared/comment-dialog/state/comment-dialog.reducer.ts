import { CommentDialogConfiguration } from '../comment-dialog.model';
import { CommentDialogAction, CommentDialogActionTypes } from './comment-dialog.actions';
import * as _ from 'lodash';

// STATE

export interface CommentDialogState {
    commentDialogData: CommentDialogData;
}

export interface CommentDialogData {
    configuration: CommentDialogConfiguration;
    comment: string;
    caller: string;
}

const initialConfiguration: CommentDialogConfiguration = {
    title: '',
    message: '',
    warnings: [],
    commentTitle: '',
    confirmButtonConfig: { label: '' },
    maxCommentLength: 0,
    visibleCommentLines: 0
};

const initialData: CommentDialogData = {
    configuration: initialConfiguration,
    comment: '',
    caller: ''
};

// REDUCER

export function commentDialogReducer(state: CommentDialogData = initialData, action: CommentDialogAction): CommentDialogData {
    switch (action.type) {
        case CommentDialogActionTypes.CommentDialogOpenMTA:
            return { ...state, configuration: _.cloneDeep(action.payload.configuration), caller: action.target };
        case CommentDialogActionTypes.CommentDialogConfirmMTA:
            return { ..._.cloneDeep(state), comment: action.payload.comment };
        default:
            return state;
    }
}
