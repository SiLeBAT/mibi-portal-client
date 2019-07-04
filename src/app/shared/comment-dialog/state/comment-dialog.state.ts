import { CommentDialogConfiguration } from '../comment-dialog.model';
import { CommentDialogAction, CommentDialogActionTypes } from './comment-dialog.actions';
import * as _ from 'lodash';

// STATE

export interface CommentDialogStates {
    commentDialog: CommentDialog;
}

export interface CommentDialog {
    configuration: CommentDialogConfiguration;
    comment: string;
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

const initialCommentDialog: CommentDialog = {
    configuration: initialConfiguration,
    comment: ''
};

// REDUCER

export function commentDialogReducer(state: CommentDialog = initialCommentDialog, action: CommentDialogAction): CommentDialog {
    return {
        configuration: reduceConfiguration(state.configuration, action),
        comment: reduceComment(state.comment, action)
    };
}

function reduceConfiguration(state: CommentDialogConfiguration, action: CommentDialogAction): CommentDialogConfiguration {
    switch (action.type) {
        case CommentDialogActionTypes.CommentDialogOpen:
            return _.cloneDeep(action.payload.configuration);
        default:
            return state;
    }
}

function reduceComment(state: string, action: CommentDialogAction): string {
    switch (action.type) {
        case CommentDialogActionTypes.CommentDialogConfirm:
            return action.payload.comment;
        default:
            return state;
    }
}
