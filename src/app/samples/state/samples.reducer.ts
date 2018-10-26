import * as _ from 'lodash';
import * as fromRoot from '../../state/app.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SamplesActions, SamplesActionTypes } from './samples.actions';
import { UserActionTypes } from '../../user/state/user.actions';
import {
    ISampleSheet,
    SampleData,
    IAnnotatedSampleData
} from '../model/sample-management.model';

export const STATE_SLICE_NAME = 'samples';
export interface IState extends fromRoot.IState {
    samples: ISamplesState;
}

export interface ISamplesState extends ISampleSheet {
    error: string;
    importedData: SampleData[];
    nrl: string;
}

const initialState: ISamplesState = {
    formData: [],
    workSheet: null,
    error: '',
    importedData: [],
    nrl: ''
};

// SELECTORS
export const getSamplesFeatureState = createFeatureSelector<ISamplesState>(STATE_SLICE_NAME);

export const getFormData = createSelector(
    getSamplesFeatureState,
    state => state.formData
);

export const getImportedData = createSelector(
    getSamplesFeatureState,
    state => state.importedData
);

export const getNRL = createSelector(
    getSamplesFeatureState,
    state => state.nrl
);

export const getDataValues = createSelector(
    getFormData,
    state => state.map(e => e.data)
);

export const getDataEdits = createSelector(
    getFormData,
    state => state.map(e => e.edits)
);

export const hasEntries = createSelector(
    getFormData,
    state => !!state.length
);

export const getSamplesError = createSelector(
    getSamplesFeatureState,
    state => state.error
);

export const hasValidationErrors = createSelector(
    getFormData,
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
export function reducer(state: ISamplesState = initialState, action: SamplesActions): ISamplesState {
    switch (action.type) {
        case UserActionTypes.LogoutUser:
            return { ...initialState };
        case SamplesActionTypes.ImportExcelFileSuccess:
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
        case SamplesActionTypes.ValidateSamplesSuccess:
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
            return { ...state, ...{ formData: mergedEntries, error: '' } };
        case SamplesActionTypes.ValidateSamplesFailure:
        case SamplesActionTypes.ExportExcelFileFailure:
            return { ...state, ...{ error: action.payload.message } };
        case SamplesActionTypes.ChangeFieldValue:
            const {
                rowIndex,
                columnId,
                originalValue,
                newValue
            } = action.payload;

            if (originalValue !== newValue) {

                const newEntries = state.formData.map((e: IAnnotatedSampleData, i: number) => {
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
                        if (newEdits[columnId] && newEdits[columnId] === newValue) {
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
