import { selectSamplesSlice, SamplesMainSlice, SamplesSlice } from '../../samples.state';
import { SendSamplesState } from './send-samples.reducer';
import { createSelector } from '@ngrx/store';
import { selectImportedFileName } from '../../state/samples.selectors';

export const selectSendSamplesState = selectSamplesSlice<SendSamplesState>();

export const selectSendSamplesLastSentFiles = createSelector(
    selectSendSamplesState,
    state => state.lastSentFiles
);

export const selectSendSamplesDialogWarnings = createSelector(
    selectSendSamplesState,
    state => state.dialogWarnings
);

export const selectSendSamplesIsFileAlreadySent = createSelector<
SamplesMainSlice & SamplesSlice<SendSamplesState>, string, string[], boolean>(
    selectImportedFileName,
    selectSendSamplesLastSentFiles,
    (fileName, lastSentFiles) => lastSentFiles.includes(fileName)
);
