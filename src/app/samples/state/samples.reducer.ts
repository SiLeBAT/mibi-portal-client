import * as _ from 'lodash';
import { createSelector } from '@ngrx/store';
import { SamplesMainAction, SamplesMainActionTypes } from './samples.actions';
import { UserActionTypes, LogoutUser } from '../../user/state/user.actions';
import {
    SampleSheet,
    SampleData,
    AnnotatedSampleData} from '../model/sample-management.model';
import { selectSamplesSlice } from '../samples.state';
import { ValidateSamplesActionTypes, ValidateSamplesAction } from '../validate-samples/store/validate-samples.actions';

export interface SamplesMainStates {
    mainData: SamplesMainData;
}

export interface SamplesMainData extends SampleSheet {
    importedData: SampleData[];
    nrl: string;
}

const initialState: SamplesMainData = {
    formData: [],
    fileDetails: null,
    importedData: [],
    nrl: ''
};

// SELECTORS

export const selectSamplesMainStates = selectSamplesSlice<SamplesMainStates>();

export const selectSamplesMainData = createSelector(
    selectSamplesMainStates,
    state => state.mainData
);

export const selectFormData = createSelector(
    selectSamplesMainData,
    state => state.formData
);

export const selectImportedData = createSelector(
    selectSamplesMainData,
    state => state.importedData
);

export const selectNRL = createSelector(
    selectSamplesMainData,
    state => state.nrl
);

export const selectFileDetails = createSelector(
    selectSamplesMainData,
    state => state.fileDetails
);

export const selectFileName = createSelector(
    selectFileDetails,
    (fileDetails) => {
        // this should never be null
        if (fileDetails !== null) {
            return fileDetails.file.name;
        } else {
            return '';
        }
    }
);

export const selectDataValues = createSelector(
    selectFormData,
    state => state.map(e => e.data)
);

export const selectDataEdits = createSelector(
    selectFormData,
    state => state.map(e => e.edits)
);

export const hasEntries = createSelector(
    selectFormData,
    state => !!state.length
);

export const hasValidationErrors = createSelector(
    selectFormData,
    state => {
        return !!state.reduce(
            (acc, entry) => {
                let count = 0;
                for (const err of Object.keys(entry.errors)) {
                    count += entry.errors[err].filter(
                        e => e.level === 2
                    ).length;
                }
                return acc += count;
            },
            0
        );
    }
);

// REDUCER

export function samplesMainReducer(
    state: SamplesMainData = initialState, action: SamplesMainAction | LogoutUser | ValidateSamplesAction
    ): SamplesMainData {
    switch (action.type) {
        case SamplesMainActionTypes.ClearSamples:
        case UserActionTypes.LogoutUser:
            return { ...initialState };
        case SamplesMainActionTypes.ImportExcelFileSuccess:
            const excelData = action.payload;
            return {
                ...state, ...{
                    formData: excelData.data.map((e: any) => ({
                        data: e,
                        errors: {},
                        corrections: [],
                        edits: {}
                    })),
                    fileDetails: excelData.fileDetails,
                    importedData: excelData.data,
                    nrl: excelData.meta.nrl
                }
            };
        case ValidateSamplesActionTypes.ValidateSamplesSuccess:
            const mergedEntries = action.payload.map(
                (response, i) => {
                    return {
                        data: response.data,
                        errors: response.errors,
                        corrections: response.corrections,
                        edits: { ...state.formData[i].edits, ...response.edits }
                    };
                }
            );
            return { ...state, ...{ formData: mergedEntries } };
        case SamplesMainActionTypes.ChangeFieldValue:
            const {
                rowIndex,
                columnId,
                originalValue,
                newValue
            } = action.payload;

            if (originalValue !== newValue) {

                const newEntries = state.formData.map((e: AnnotatedSampleData, i: number) => {
                    let newData = e.data;
                    let newEdits = e.edits;
                    let newErrors = e.errors;
                    let newCorrections = e.corrections;

                    if (i === rowIndex) {
                        newData = {
                            ...e.data, ...{
                                [columnId]: newValue
                            }
                        };
                        newEdits = { ...e.edits };
                        if (newValue === state.importedData[i][columnId]) {
                            delete newEdits[columnId];
                        } else {
                            newEdits[columnId] = state.importedData[i][columnId] ;
                        }
                        newErrors = {
                            ...e.errors, ...{
                                [columnId]: []
                            }
                        };
                        newCorrections = _.filter(e.corrections, c => c.field !== columnId);
                    }

                    return {
                        data: newData,
                        errors: newErrors,
                        edits: newEdits,
                        corrections: newCorrections
                    };
                });

                return {
                    ...state,
                    ...{
                        formData: newEntries
                    }
                };
            }
            return state;
        default:
            return state;
    }
}
