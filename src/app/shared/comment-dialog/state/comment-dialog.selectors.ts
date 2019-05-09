import { CommentDialogStates } from './comment-dialog.state';
import { createSelector } from '@ngrx/store';
import { selectSharedSlice } from '../../shared.state';

export const selectCommentDialogStates = selectSharedSlice<CommentDialogStates>();

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
