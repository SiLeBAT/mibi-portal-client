import { SendSamplesAction, SendSamplesActionTypes } from './send-samples.actions';
import { SendSamplesWarnings } from '../model/send-samples-warnings';
import * as _ from 'lodash';

// STATE

export interface SendSamplesStates {
    lastSentFiles: string[];
    sendWarnings: SendSamplesWarnings;
}

const initialWarnings: SendSamplesWarnings = {
    fileAlreadySent: false
};

// REDUCER

export function sendSamplesLastSentFileReducer(state: string[] = [], action: SendSamplesAction): string[] {
    switch (action.type) {
        case SendSamplesActionTypes.SendSamplesSuccess:
            return _.union(state, [action.payload.sentFile]);
        default:
            return state;
    }
}

export function sendSamplesWarningsReducer(state: SendSamplesWarnings = initialWarnings, action: SendSamplesAction): SendSamplesWarnings {
    switch (action.type) {
        case SendSamplesActionTypes.SendSamplesOpenDialog:
            return _.cloneDeep(action.payload.warnings);
        default:
            return state;
    }
}
