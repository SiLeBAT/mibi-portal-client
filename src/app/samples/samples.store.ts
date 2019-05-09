import { ActionReducerMap } from '@ngrx/store';
import { SamplesMainEffects } from './state/samples.effects';
import { SamplesMainStates, samplesMainReducer } from './state/samples.reducer';
import { SamplesMainAction } from './state/samples.actions';
import { SamplesSlice } from './samples.state';
import { LogoutUser } from '../user/state/user.actions';
import { SendSamplesAction } from './send-samples/store/send-samples.actions';
import { CommentDialogStates, commentDialogReducer } from './comment-dialog/store/comment-dialog.state';
import { CommentDialogAction } from './comment-dialog/store/comment-dialog.actions';
import { CommentDialogEffects } from './comment-dialog/store/comment-dialog.effects';
import { ValidateSamplesAction } from './validate-samples/store/validate-samples.actions';
import { ValidateSamplesEffects } from './validate-samples/store/validate-samples.effects';
import { SendSamplesFromStoreAction } from './send-samples-from-store/store/send-samples-from-store.actions';
import { SendSamplesFromStoreEffects } from './send-samples-from-store/store/send-samples-from-store.effects';
import { SendSamplesStates, sendSamplesLastSentFileReducer, sendSamplesWarningsReducer } from './send-samples/store/send-samples.state';
import { SendSamplesEffects } from './send-samples/effects/send-samples.effects';

export interface Samples extends SamplesSlice<SamplesMainStates> {}

type SamplesStates = SamplesMainStates & CommentDialogStates & SendSamplesStates;
type SamplesReducerAction =
SamplesMainAction
| CommentDialogAction
| SendSamplesAction
| ValidateSamplesAction
| SendSamplesFromStoreAction
| LogoutUser;

export const samplesReducerMap: ActionReducerMap<SamplesStates, SamplesReducerAction> = {
    mainData: samplesMainReducer,
    commentDialog: commentDialogReducer,
    lastSentFiles: sendSamplesLastSentFileReducer,
    sendWarnings: sendSamplesWarningsReducer
};
export const samplesEffects = [
    SamplesMainEffects, CommentDialogEffects, SendSamplesEffects, ValidateSamplesEffects, SendSamplesFromStoreEffects
];
