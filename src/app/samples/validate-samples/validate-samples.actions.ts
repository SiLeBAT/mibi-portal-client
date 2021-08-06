import { Action } from '@ngrx/store';

export enum ValidateSamplesActionTypes {
    ValidateSamplesSSA = '[Samples/ValidateSamples] Validate samples',
    ValidateSamplesValidateSSA = '[Samples/ValidateSamples] Validate samples by server'
}

export class ValidateSamplesSSA implements Action {
    readonly type = ValidateSamplesActionTypes.ValidateSamplesSSA;
}

export class ValidateSamplesValidateSSA implements Action {
    readonly type = ValidateSamplesActionTypes.ValidateSamplesValidateSSA;
}

export type ValidateSamplesAction = ValidateSamplesSSA | ValidateSamplesValidateSSA;
