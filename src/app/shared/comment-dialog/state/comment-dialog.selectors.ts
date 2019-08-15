import { CommentDialogState } from './comment-dialog.reducer';
import { createSelector } from '@ngrx/store';
import { selectSharedSlice } from '../../shared.state';

export const selectCommentDialogState = selectSharedSlice<CommentDialogState>();

export const selectCommentDialogData = createSelector(
    selectCommentDialogState,
    state => state.commentDialogData
);

export const selectCommentDialogConfiguration = createSelector(
    selectCommentDialogData,
    state => state.configuration
);

export const selectCommentDialogComment = createSelector(
    selectCommentDialogData,
    state => state.comment
);

export const selectCommentDialogCaller = createSelector(
    selectCommentDialogData,
    state => state.caller
);
