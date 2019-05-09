import { CommandAction, ResponseAction } from '../../../shared/command/command.actions';
import { AnnotatedSampleData } from '../../model/sample-management.model';

export enum ValidateSamplesActionTypes {
    ValidateSamples = '[Samples/ValidateSamples] Validate samples',
    ValidateSamplesSuccess = '[Samples/ValidateSamples] Successfully validated samples',
    ValidateSamplesFailure = '[Samples/ValidateSamples] Validating samples failed'
}

export class ValidateSamples implements CommandAction {
    readonly type = ValidateSamplesActionTypes.ValidateSamples;

    constructor(public source: string) { }
}

export class ValidateSamplesSuccess implements ResponseAction {
    readonly type = ValidateSamplesActionTypes.ValidateSamplesSuccess;
    readonly command = ValidateSamplesActionTypes.ValidateSamples;

    constructor(public payload: AnnotatedSampleData[]) { }
}

export class ValidateSamplesFailure implements ResponseAction {
    readonly type = ValidateSamplesActionTypes.ValidateSamplesFailure;
    readonly command = ValidateSamplesActionTypes.ValidateSamples;
}

export type ValidateSamplesAction = ValidateSamples | ValidateSamplesSuccess | ValidateSamplesFailure;
