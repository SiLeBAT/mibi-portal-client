import { SendSamplesAction, SendSamplesActionTypes } from './send-samples.actions';
import * as _ from 'lodash';

// STATE

export interface SendSamplesState {
    lastSentFiles: string[];
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
