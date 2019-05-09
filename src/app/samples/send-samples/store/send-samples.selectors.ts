import { selectSamplesSlice } from '../../samples.state';
import { SendSamplesStates } from './send-samples.state';
import { createSelector } from '@ngrx/store';

export const selectSendSamplesStates = selectSamplesSlice<SendSamplesStates>();

export const selectSendSamplesLastSentFiles = createSelector(
    selectSendSamplesStates,
    state => state.lastSentFiles
);

export const selectSendSamplesWarnings = createSelector(
    selectSendSamplesStates,
    state => state.sendWarnings
);
