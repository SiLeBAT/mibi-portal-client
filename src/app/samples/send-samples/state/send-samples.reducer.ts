import { sendSamplesAddSentFileSOA, sendSamplesUpdateDialogWarningsSOA } from './send-samples.actions';
import _ from 'lodash-es';
import { DialogWarning } from '../../../shared/dialog/dialog.model';
import { createReducer, on } from '@ngrx/store';

// STATE

export interface SendSamplesState {
    lastSentFiles: string[];
    dialogWarnings: DialogWarning[];
}

// REDUCER

export const sendSamplesLastSentFilesReducer = createReducer(
    [],
    on(sendSamplesAddSentFileSOA, (state, action) => _.union(state, [action.sentFile]))
);

export const sendSamplesDialogWarningsReducer = createReducer(
    [],
    on(sendSamplesUpdateDialogWarningsSOA, (state, action) => action.warnings)
);
