import { Action, ActionReducerMap } from '@ngrx/store';
import { SamplesMainState, samplesMainReducer } from './state/samples.reducer';
import { ValidateSamplesEffects } from './validate-samples/validate-samples.effects';
import { SendSamplesState, sendSamplesLastSentFilesReducer, sendSamplesDialogWarningsReducer } from './send-samples/state/send-samples.reducer';
import { SendSamplesEffects } from './send-samples/send-samples.effects';
import { CloseSamplesEffects } from './close-samples/close-samples.effects';
import { ImportSamplesEffects } from './import-samples/import-samples.effects';
import { ExportSamplesEffects } from './export-samples/export-samples.effects';

type SamplesState = SamplesMainState & SendSamplesState;

export const samplesReducerMap: ActionReducerMap<SamplesState, Action> = {
    mainData: samplesMainReducer,
    lastSentFiles: sendSamplesLastSentFilesReducer,
    dialogWarnings: sendSamplesDialogWarningsReducer
};
export const samplesEffects = [
    SendSamplesEffects,
    ValidateSamplesEffects,
    CloseSamplesEffects,
    ImportSamplesEffects,
    ExportSamplesEffects
];
