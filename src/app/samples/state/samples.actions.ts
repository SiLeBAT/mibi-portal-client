import { createAction, props } from '@ngrx/store';
import { ChangedDataGridField, SampleSet, Sample, MetaDataCollection } from '../model/sample-management.model';

// Samples

export const samplesUpdateMainDataSOA = createAction(
    '[Samples] Set all samples related data from sample set',
    props<{ sampleSet: SampleSet }>()
);

export const samplesDestroyMainDataSOA = createAction(
    '[Samples] Clear all samples related data'
);

export const samplesUpdateSamplesSOA = createAction(
    '[Samples] Set samples',
    props<{ samples: Sample[] }>()
);

export const samplesUpdateSampleMetaDataSOA = createAction(
    '[Samples] Set individual sample metadata',
    props<{ metaData: MetaDataCollection }>()
);

export const samplesUpdateSampleDataEntrySOA = createAction(
    '[Samples] Change single sample data field value',
    props<{ changedField: ChangedDataGridField }>()
);
