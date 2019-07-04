import { createSelector } from '@ngrx/store';
import { SampleEdits, SampleData, SamplePropertyValues } from '../model/sample-management.model';
import { selectSamplesSlice } from '../samples.state';
import { SamplesMainStates } from './samples.state';
import * as _ from 'lodash';

export function getDataValuesFromAnnotatedData(sampleData: SampleData): SamplePropertyValues {
    const result: SamplePropertyValues = {};
    Object.keys(sampleData).forEach(prop => result[prop] = sampleData[prop].value);
    return result;
}

export const selectSamplesMainStates = selectSamplesSlice<SamplesMainStates>();

export const selectSamplesMainData = createSelector(selectSamplesMainStates, state => state.mainData);

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

export const selectDataValues = createSelector(selectFormData, state => state.map(getDataValuesFromAnnotatedData));

export const selectDataEdits = createSelector(selectFormData, state => state.map(e => {
    const result: SampleEdits = {};
    Object.keys(e).forEach(prop => {
        if (_.isString(e[prop].oldValue)) {
            result[prop] = e[prop].oldValue || '';
        }
    });
    return result;
}));

export const getMarshalData = createSelector(selectSamplesMainData, state => ({
    samples: state.formData,
    meta: state.meta
}));

export const selectHasEntries = createSelector(selectFormData, state => !!state.length);

export const selectHasValidationErrors = createSelector(selectFormData, state => !!state.length);
