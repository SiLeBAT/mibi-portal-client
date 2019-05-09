import { selectCoreSlice } from '../../core.state';
import { DialogStates } from './dialog.state';
import { createSelector } from '@ngrx/store';

export const selectDialogStates = selectCoreSlice<DialogStates>();

export const selectDialogConfiguration = createSelector(
    selectDialogStates,
    state => state.dialogConfiguration
);
