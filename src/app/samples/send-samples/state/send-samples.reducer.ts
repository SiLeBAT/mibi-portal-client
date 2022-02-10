import { sendSamplesAddSentFileSOA, sendSamplesUpdateDialogWarningsSOA } from './send-samples.actions';
import _ from 'lodash';
import { DialogWarning } from '../../../shared/dialog/dialog.model';
import { createReducer, on } from '@ngrx/store';

// STATE

export interface SendSamplesState {
    lastSentFiles: string[];
    dialogWarnings: DialogWarning[];
}

// REDUCER

export const sendSamplesLastSentFilesReducer = createReducer<string[]>(
    [],
    on(sendSamplesAddSentFileSOA, (state, action) => _.union(state, [action.sentFile]))
);

export const sendSamplesDialogWarningsReducer = createReducer<DialogWarning[]>(
    [],
    on(sendSamplesUpdateDialogWarningsSOA, (state, action) => action.warnings)
);
