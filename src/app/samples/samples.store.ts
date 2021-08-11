import { ActionReducerMap } from '@ngrx/store';
import { SamplesMainState, samplesMainReducer } from './state/samples.reducer';
import { SamplesMainAction } from './state/samples.actions';
import { SendSamplesAction } from './send-samples/state/send-samples.actions';
import { ValidateSamplesAction } from './validate-samples/validate-samples.actions';
import { ValidateSamplesEffects } from './validate-samples/validate-samples.effects';
import { SendSamplesState, sendSamplesLastSentFilesReducer } from './send-samples/state/send-samples.reducer';
import { SendSamplesEffects } from './send-samples/send-samples.effects';
import { CloseSamplesEffects } from './close-samples/close-samples.effects';
import { ImportSamplesEffects } from './import-samples.ts/import-samples.effects';
import { ExportSamplesEffects } from './export-samples/export-samples.effects';

type SamplesState = SamplesMainState & SendSamplesState;
type SamplesReducerAction =
    SamplesMainAction
    | SendSamplesAction
    | ValidateSamplesAction;

export const samplesReducerMap: ActionReducerMap<SamplesState, SamplesReducerAction> = {
    mainData: samplesMainReducer,
    lastSentFiles: sendSamplesLastSentFilesReducer
};
export const samplesEffects = [
    SendSamplesEffects,
    ValidateSamplesEffects,
    CloseSamplesEffects,
    ImportSamplesEffects,
    ExportSamplesEffects
];
