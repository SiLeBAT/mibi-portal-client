import { ActionReducerMap } from '@ngrx/store';
import { SamplesMainEffects } from './state/samples.effects';
import { SamplesMainStates, samplesMainReducer } from './state/samples.reducer';
import { SamplesMainAction } from './state/samples.actions';
import { SamplesSlice } from './samples.state';
import { LogoutUser } from '../user/state/user.actions';
import { SendSamplesAction } from './send-samples/state/send-samples.actions';
import { CommentDialogStates, commentDialogReducer } from '../shared/comment-dialog/state/comment-dialog.state';
import { CommentDialogAction } from '../shared/comment-dialog/state/comment-dialog.actions';
import { CommentDialogEffects } from '../shared/comment-dialog/effects/comment-dialog.effects';
import { ValidateSamplesAction } from './validate-samples/state/validate-samples.actions';
import { ValidateSamplesEffects } from './validate-samples/effects/validate-samples.effects';
import { SendSamplesStates, sendSamplesLastSentFileReducer, sendSamplesWarningsReducer } from './send-samples/state/send-samples.state';
import { SendSamplesEffects } from './send-samples/effects/send-samples.effects';

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
