import { CommentDialogState } from './comment-dialog.reducer';
import { createSelector } from '@ngrx/store';
import { selectSharedSlice } from '../../shared.state';

export const selectCommentDialogState = selectSharedSlice<CommentDialogState>();

export const selectCommentDialog = createSelector(
    selectCommentDialogState,
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
