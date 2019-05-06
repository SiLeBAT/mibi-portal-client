import { FileInfo } from '../model/file-info.model';
import { SendSamplesAction, SendSamplesActionTypes } from './send-samples.actions';

// STATE

export interface SendSamplesStates {
    lastSentFile: FileInfo;
}

const initialLastSentFile: FileInfo = {
    fileName : ''
};

// REDUCER

export function sendSamplesLastSentFileReducer(state: FileInfo = initialLastSentFile, action: SendSamplesAction): FileInfo {
    switch (action.type) {
        case SendSamplesActionTypes.SendSamplesSuccess:
            return { ...action.payload.sentFile };
        default:
            return state;
    }
}
