import { SendSamplesAction, SendSamplesActionTypes } from './send-samples.actions';
import { SendSamplesWarnings } from '../send-samples.model';
import * as _ from 'lodash';

// STATE

export interface SendSamplesState {
    lastSentFiles: string[];
    sendWarnings: SendSamplesWarnings;
}

const initialWarnings: SendSamplesWarnings = {
    fileAlreadySent: false
};

// REDUCER

export function sendSamplesLastSentFileReducer(state: string[] = [], action: SendSamplesAction): string[] {
    switch (action.type) {
        case SendSamplesActionTypes.AddSentFileSOA:
            return _.union(state, [action.payload.sentFile]);
        default:
            return state;
    }
}

export function sendSamplesWarningsReducer(state: SendSamplesWarnings = initialWarnings, action: SendSamplesAction): SendSamplesWarnings {
    switch (action.type) {
        case SendSamplesActionTypes.UpdateSampleWarningsSOA:
            return _.cloneDeep(action.payload.warnings);
        default:
            return state;
    }
}
