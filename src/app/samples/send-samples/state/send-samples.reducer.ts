import { SendSamplesAction, SendSamplesActionTypes } from './send-samples.actions';
import * as _ from 'lodash';
import { DialogWarning } from '../../../shared/dialog/dialog.model';

// STATE

export interface SendSamplesState {
    lastSentFiles: string[];
    dialogWarnings: DialogWarning[];
}

// REDUCER

export function sendSamplesLastSentFilesReducer(state: string[] = [], action: SendSamplesAction): string[] {
    switch (action.type) {
        case SendSamplesActionTypes.SendSamplesAddSentFileSOA:
            return _.union(state, [action.payload.sentFile]);
        default:
            return state;
    }
}

export function sendSamplesDialogWarningsReducer(state: DialogWarning[] = [], action: SendSamplesAction): DialogWarning[] {
    switch (action.type) {
        case SendSamplesActionTypes.SendSamplesUpdateDialogWarningsSOA:
            return action.payload.warnings;
        default:
            return state;
    }
}
