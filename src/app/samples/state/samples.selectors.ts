import { SampleData, Sample } from './../model/sample-management.model';
import { createSelector } from '@ngrx/store';
import { SamplePropertyValues } from '../model/sample-management.model';
import { selectSamplesSlice } from '../samples.state';
import { SamplesMainState } from './samples.reducer';
import * as _ from 'lodash';

export function getDataValuesFromAnnotatedData(sampleData: SampleData): SamplePropertyValues {
    const result: SamplePropertyValues = {};
    Object.keys(sampleData).forEach(prop => result[prop] = sampleData[prop].value);
    return result;
}

export function getDataFromAnnotatedData(sample: Sample): SampleData {
    return sample.sampleData;
}

export const selectSamplesMainState = selectSamplesSlice<SamplesMainState>();

export const selectSamplesMainData = createSelector(selectSamplesMainState, state => state.mainData);

export const selectFormData = createSelector(selectSamplesMainData, state => state.formData);

export const selectImportedFile = createSelector(selectSamplesMainData, state => state.importedFile);

export const selectImportedFileData = createSelector(selectImportedFile, state => state ? state.data : []);

export const selectMetaData = createSelector(selectSamplesMainData, state => state.meta);

export const selectImportedFileName = createSelector(selectImportedFile, (file) => {
    // this should never be null
    if (file !== null) {
        return file.fileName;
    } else {
        return '';
    }
});

export const selectMarshalData = createSelector(selectSamplesMainData, state => ({
    samples: state.formData,
    meta: state.meta
}));

export const selectHasEntries = createSelector(selectFormData, state => !!state.length);

export const selectHasValidationErrors = createSelector(selectFormData, state => !!state.length);
