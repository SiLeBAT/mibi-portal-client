import { Action } from '@ngrx/store';

export enum ValidateSamplesActionTypes {
    ValidateSamplesMSA = '[Samples/ValidateSamples] Validate samples'
}

export class ValidateSamplesMSA implements Action {
    readonly type = ValidateSamplesActionTypes.ValidateSamplesMSA;
}

export type ValidateSamplesAction = ValidateSamplesMSA;
