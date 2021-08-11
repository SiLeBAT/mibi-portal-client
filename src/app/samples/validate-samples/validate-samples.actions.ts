import { Action } from '@ngrx/store';

export enum ValidateSamplesActionTypes {
    ValidateSamplesSSA = '[Samples/ValidateSamples] Validate samples'
}

export class ValidateSamplesSSA implements Action {
    readonly type = ValidateSamplesActionTypes.ValidateSamplesSSA;
}

export type ValidateSamplesAction = ValidateSamplesSSA;
