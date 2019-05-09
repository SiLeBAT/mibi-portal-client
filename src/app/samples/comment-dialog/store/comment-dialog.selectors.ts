import { selectSamplesSlice } from '../../samples.state';
import { CommentDialogStates } from './comment-dialog.state';
import { createSelector, createFeatureSelector } from '@ngrx/store';

export const selectCommentDialogStates = selectSamplesSlice<CommentDialogStates>();

export const selectCommentDialog = createSelector(
    selectCommentDialogStates,
    state => state.commentDialog
);

export const selectCommentDialogConfiguration = createSelector(
    selectCommentDialog,
    state => state.configuration
);

export const selectCommentDialogComment = createSelector(
    selectCommentDialog,
    state => state.comment
);
