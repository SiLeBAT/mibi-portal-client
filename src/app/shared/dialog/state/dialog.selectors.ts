import { DialogStates } from './dialog.state';
import { createSelector } from '@ngrx/store';
import { selectSharedSlice } from '../../shared.state';

export const selectDialogStates = selectSharedSlice<DialogStates>();

export const selectDialogConfiguration = createSelector(
    selectDialogStates,
    state => state.dialogConfiguration
);
