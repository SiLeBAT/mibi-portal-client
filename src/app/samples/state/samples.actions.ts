import { Action } from '@ngrx/store';
import { ChangedDataGridField, SampleSet, Sample, MetaDataCollection } from '../model/sample-management.model';

export enum SamplesMainActionTypes {
    UpdateSampleSetSOA = '[Samples] Set sample set',
    DestroySampleSetSOA = '[Samples] Clear store of all samples related data',
    UpdateSamplesSOA = '[Samples] Set samples',
    UpdateSampleMetaDataSOA = '[Samples] Set sample metadata',
    UpdateSampleDataEntrySOA = '[Samples] Change single sample data field value'
}

// Samples

export class UpdateSampleSetSOA implements Action {
    readonly type = SamplesMainActionTypes.UpdateSampleSetSOA;

    constructor(public payload: SampleSet) { }
}

export class DestroySampleSetSOA implements Action {
    readonly type = SamplesMainActionTypes.DestroySampleSetSOA;
}

export class UpdateSamplesSOA implements Action {
    readonly type = SamplesMainActionTypes.UpdateSamplesSOA;

    constructor(public payload: Sample[]) { }
}

export class UpdateSampleMetaDataSOA implements Action {
    readonly type = SamplesMainActionTypes.UpdateSampleMetaDataSOA;

    constructor(public payload: MetaDataCollection) { }
}
export class UpdateSampleDataEntrySOA implements Action {
    readonly type = SamplesMainActionTypes.UpdateSampleDataEntrySOA;

    constructor(public payload: ChangedDataGridField) { }
}

export type SamplesMainAction =
    UpdateSampleSetSOA
    | DestroySampleSetSOA
    | UpdateSamplesSOA
    | UpdateSampleDataEntrySOA
    | UpdateSampleMetaDataSOA;
