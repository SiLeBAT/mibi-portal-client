import { Action } from '@ngrx/store';

export enum CloseSamplesActionTypes {
    CloseSamplesSSA = '[Samples/CloseSamples] Close samples page'
}

export class CloseSamplesSSA implements Action {
    readonly type = CloseSamplesActionTypes.CloseSamplesSSA;
}

export type CloseSamplesAction = CloseSamplesSSA;
