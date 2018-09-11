import { IAnnotatedSampleData, IWorkSheet } from '../model/sample-management.model';
import * as fromRoot from '../../state/app.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SamplesActions, SamplesActionTypes } from './samples.actions';
import { UserActionTypes } from '../../user/state/user.actions';

export const STATE_SLICE_NAME = 'samples';
export interface IState extends fromRoot.IState {
    samples: ISamplesState;
}

export interface ISamplesState {
    entries: IAnnotatedSampleData[];
    workSheet: IWorkSheet | null;
    error: string;
}

const initialState: ISamplesState = {
    entries: [],
    workSheet: null,
    error: ''
};

// SELECTORS
export const getSamplesFeatureState = createFeatureSelector<ISamplesState>(STATE_SLICE_NAME);

export const getAnnotatedSampleData = createSelector(
    getSamplesFeatureState,
    state => state.entries
);

export const getData = createSelector(
    getAnnotatedSampleData,
    state => state.map(e => e.data)
);

export const hasEntries = createSelector(
    getAnnotatedSampleData,
    state => !!state.length
);

export const getSamplesError = createSelector(
    getSamplesFeatureState,
    state => state.error
);

export const hasValidationErrors = createSelector(
    getAnnotatedSampleData,
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
                entries: excelData.data.data.map((e: any) => ({
                    data: e,
                    errors: {},
                    corrections: [],
                    edits: {}
                })),
                workSheet: excelData.workSheet,
                error: ''
            };
        case SamplesActionTypes.ValidateSamplesSuccess:
            const mergedEntries = action.payload.map(
                (response, i) => {
                    return {
                        data: response.data,
                        errors: response.errors,
                        corrections: response.corrections,
                        edits: { ...response.edits, ...state.entries[i].edits }
                    };
                }
            );
            return { ...state, ...{ entries: mergedEntries, error: '' } };
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

                const newEntries = state.entries.map((e: IAnnotatedSampleData, i: number) => {
                    let newData = e.data;
                    let newEdits = e.edits;

                    if (i === rowIndex) {
                        newData = {
                            ...e.data, ...{
                                [columnId]: newValue
                            }
                        };
                        newEdits = { ...e.edits };
                        if (newEdits[columnId] === newValue) {
                            delete newEdits[columnId];
                        } else {
                            newEdits[columnId] = originalValue;
                        }
                    }

                    return {
                        data: newData,
                        errors: e.errors,
                        edits: newEdits,
                        corrections: e.corrections
                    };
                });

                return {
                    ...state,
                    ...{
                        entries: newEntries
                    }
                };
            }
            return state;
        default:
            return state;
    }
}
