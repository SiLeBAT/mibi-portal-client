import { selectSamplesSlice } from '../../samples.state';
import { SendSamplesState } from './send-samples.reducer';
import { createSelector } from '@ngrx/store';

export const selectSendSamplesState = selectSamplesSlice<SendSamplesState>();

export const selectSendSamplesLastSentFiles = createSelector(
    selectSendSamplesState,
    state => state.lastSentFiles
);

export const selectSendSamplesWarnings = createSelector(
    selectSendSamplesState,
    state => state.sendWarnings
);
