import { DialogState } from './dialog.reducer';
import { createSelector } from '@ngrx/store';
import { selectSharedSlice } from '../../shared.state';

export const selectDialogState = selectSharedSlice<DialogState>();

export const selectDialogConfiguration = createSelector(
    selectDialogState,
    state => state.dialogConfiguration
);
