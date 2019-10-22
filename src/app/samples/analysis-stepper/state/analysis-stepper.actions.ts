import { Action } from '@ngrx/store';
export enum AnalysisStepperActionTypes {
    OpenAnalysisStepperSSA = '[Shared/AnalysisStepper] Open analysis stepper'
}

export class SendSamplesOpenAnalysisDialogSSA implements Action {
    readonly type = AnalysisStepperActionTypes.OpenAnalysisStepperSSA;
}

export type AnalysisStepperAction =
    SendSamplesOpenAnalysisDialogSSA;
