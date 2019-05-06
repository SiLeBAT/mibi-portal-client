import { selectSamplesSlice } from '../../samples.state';
import { SendSamplesStates } from './send-samples.state';
import { createSelector } from '@ngrx/store';

export const selectSendSamplesStates = selectSamplesSlice<SendSamplesStates>();

export const selectSendSamplesLastSentFile = createSelector(
    selectSendSamplesStates,
    state => state.lastSentFile
);
