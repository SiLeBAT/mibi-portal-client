import { DialogState } from './dialog.reducer';
import { createSelector } from '@ngrx/store';
import { selectSharedSlice } from '../../shared.state';

export const selectDialogState = selectSharedSlice<DialogState>();

export const selectDialogData = createSelector(
    selectDialogState,
    state => state.dialogData
);

export const selectDialogConfiguration = createSelector(
    selectDialogData,
    dialogData => dialogData.configuration
);

export const selectDialogCaller = createSelector(
    selectDialogData,
    dialogData => dialogData.caller
);
