import { SampleData, Sample, SampleValidationErrorLevel, AnnotatedSampleDataEntry, SamplePropertyValues } from '../model/sample-management.model';
import { createSelector } from '@ngrx/store';
import { selectSamplesSlice } from '../samples.state';
import { SamplesMainState } from './samples.reducer';
import _ from 'lodash-es';

export function getDataValuesFromAnnotatedData(sampleData: SampleData): SamplePropertyValues {
    const result: Partial<SamplePropertyValues> = {};
    Object.keys(sampleData).forEach((prop: keyof SampleData) => result[prop] = sampleData[prop].value);
    return result as SamplePropertyValues;
}

export function getSampleDataEntryHasValidationErrors(
    sampleDataEntry: AnnotatedSampleDataEntry, errorLevel: SampleValidationErrorLevel): boolean {
    return sampleDataEntry.errors.find(error =>
        error.level === errorLevel
    ) !== undefined;
}

export function getSampleHasValidationErrors(sample: Sample, errorLevel: SampleValidationErrorLevel): boolean {
    return _.find(sample.sampleData, sampleDataEntry =>
        getSampleDataEntryHasValidationErrors(sampleDataEntry, errorLevel)
    ) !== undefined;
}

export function getSamplesHasValidationErrors(samples: Sample[], errorLevel: SampleValidationErrorLevel): boolean {
    return samples.find(sample => getSampleHasValidationErrors(sample, errorLevel)) !== undefined;
}

export const selectSamplesMainState = selectSamplesSlice<SamplesMainState>();

export const selectSamplesMainData = createSelector(selectSamplesMainState, state => state.mainData);

export const selectSampleData = createSelector(selectSamplesMainData, mainData => mainData.sampleData);

export const selectImportedFile = createSelector(selectSamplesMainData, mainData => mainData.importedFile);

export const selectImportedFileData = createSelector(selectImportedFile, importedFile => importedFile ? importedFile.data : []);

export const selectMetaData = createSelector(selectSamplesMainData, mainData => mainData.meta);

export const selectImportedFileName = createSelector(selectImportedFile, file => {
    // this should never be null
    if (file !== null) {
        return file.fileName;
    } else {
        return '';
    }
});

export const selectMarshalData = createSelector(selectSamplesMainData, mainData => ({
    samples: mainData.sampleData,
    meta: mainData.meta
}));

export const selectHasEntries = createSelector(selectSampleData, samples => samples.length !== 0);

export const selectHasErrors = createSelector(selectSampleData, samples =>
    getSamplesHasValidationErrors(samples, SampleValidationErrorLevel.ERROR)
);

export const selectHasWarnings = createSelector(selectSampleData, samples =>
    getSamplesHasValidationErrors(samples, SampleValidationErrorLevel.WARNING)
);

export const selectHasAutoCorrections = createSelector(selectSampleData, samples =>
    getSamplesHasValidationErrors(samples, SampleValidationErrorLevel.AUTOCORRECTED)
);
