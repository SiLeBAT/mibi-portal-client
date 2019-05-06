import * as _ from 'lodash';
import { createSelector, MemoizedSelector } from '@ngrx/store';
import { SamplesMainAction, SamplesMainActionTypes } from './samples.actions';
import { UserActionTypes, LogoutUser } from '../../user/state/user.actions';
import {
    SampleSheet,
    SampleData,
    AnnotatedSampleData,
    ImportedExcelFileDetails
} from '../model/sample-management.model';
import { SamplesSlice, selectSamplesSlice } from '../samples.state';
import { stat } from 'fs';
import { ValidateSamplesActionTypes, ValidateSamplesAction } from '../validate-samples/store/validate-samples.actions';
import { FileInfo } from '../send-samples/model/file-info.model';

export interface SamplesMainStates {
    mainData: MainData;
}

export interface MainData extends SampleSheet {
    importedData: SampleData[];
    nrl: string;
}

const initialState: MainData = {
    formData: [],
    workSheet: null,
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

export const selectImportedExcelFileDetails = createSelector(
    selectSamplesMainData,
    state => state.workSheet
);

export const selectFileInfo = createSelector(
    selectImportedExcelFileDetails,
    (importedExcelFileDetails) => {
        let fileInfo: FileInfo;
        // this should never be null
        if (importedExcelFileDetails !== null) {
            fileInfo = {
                fileName: importedExcelFileDetails.file.name
            };
        } else {
            fileInfo = {
                fileName: ''
            };
        }
        return fileInfo;
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
    state: MainData = initialState, action: SamplesMainAction | LogoutUser | ValidateSamplesAction
    ): MainData {
    // console.log('reduced: ' + action.type);
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
                    workSheet: excelData.workSheet,
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
