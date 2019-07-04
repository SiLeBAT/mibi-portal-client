import { ActionReducerMap } from '@ngrx/store';
import { SamplesMainEffects } from './samples.effects';
import { SamplesMainStates, samplesMainReducer } from './state/samples.state';
import { SamplesMainAction } from './state/samples.actions';
import { SamplesSlice } from './samples.state';
import { LogoutUser } from '../user/state/user.actions';
import { SendSamplesAction } from './send-samples/state/send-samples.actions';
import { CommentDialogEffects } from '../shared/comment-dialog/comment-dialog.effects';
import { ValidateSamplesAction } from './validate-samples/validate-samples.actions';
import { ValidateSamplesEffects } from './validate-samples/validate-samples.effects';
import { SendSamplesStates, sendSamplesLastSentFileReducer, sendSamplesWarningsReducer } from './send-samples/state/send-samples.state';
import { SendSamplesEffects } from './send-samples/send-samples.effects';

export interface Samples extends SamplesSlice<SamplesMainStates> {}

type SamplesStates = SamplesMainStates & SendSamplesStates;
type SamplesReducerAction =
SamplesMainAction
| SendSamplesAction
| ValidateSamplesAction
| LogoutUser;

export const samplesReducerMap: ActionReducerMap<SamplesStates, SamplesReducerAction> = {
    mainData: samplesMainReducer,
    lastSentFiles: sendSamplesLastSentFileReducer,
    sendWarnings: sendSamplesWarningsReducer
};
export const samplesEffects = [
    SamplesMainEffects, CommentDialogEffects, SendSamplesEffects, ValidateSamplesEffects
];
