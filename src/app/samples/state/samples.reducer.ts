import * as _ from 'lodash';
import { createSelector } from '@ngrx/store';
import { SamplesMainAction, SamplesMainActionTypes } from './samples.actions';
import { UserActionTypes, LogoutUser } from '../../user/state/user.actions';
import {
    SamplePropertyValues,
    SampleData,
    SampleSetMetaData,
    SampleEdits,
    SampleSet
} from '../model/sample-management.model';
import { selectSamplesSlice } from '../samples.state';
import { ValidateSamplesActionTypes, ValidateSamplesAction } from '../validate-samples/state/validate-samples.actions';
import { Urgency } from '../model/sample.enums';

export interface SamplesMainStates {
    mainData: SamplesMainData;
}

export interface ImportedFile {
    fileName: string;
    data: SamplePropertyValues[];
}
export interface SamplesMainData {
    formData: SampleData[];
    importedFile: ImportedFile | null;
    meta: SampleSetMetaData;
}

const initialState: SamplesMainData = {
    formData: [],
    importedFile: null,
    meta: {
        nrl: '',
        urgency: Urgency.NORMAL,
        sender: {
            instituteName: '',
            department: '',
            street: '',
            zip: '',
            city: '',
            contactPerson: '',
            telephone: '',
            email: ''
        },
        analysis: {
            species: false,
            serological: false,
            phageTyping: false,
            resistance: false,
            vaccination: false,
            molecularTyping: false,
            toxin: false,
            zoonosenIsolate: false,
            esblAmpCCarbapenemasen: false,
            other: '',
            compareHuman: false
        },
        fileName: ''

    }
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

export const selectImportedFile = createSelector(
    selectSamplesMainData,
    state => state.importedFile
);

export const selectImportedFileData = createSelector(
    selectImportedFile,
    state => state ? state.data : []
);

export const selectMetaData = createSelector(
    selectSamplesMainData,
    state => state.meta
);

export const selectImportedFileName = createSelector(
    selectImportedFile,
    (file) => {
        // this should never be null
        if (file !== null) {
            return file.fileName;
        } else {
            return '';
        }
    }
);

export const selectDataValues = createSelector(
    selectFormData,
    state => state.map(getDataValuesFromAnnotatedData)
);

export const selectDataEdits = createSelector(
    selectFormData,
    state => state.map(e => {
        const result: SampleEdits = {};
        Object.keys(e).forEach(prop => {
            if (_.isString(e[prop].oldValue)) {
                result[prop] = e[prop].oldValue || '';
            }
        });
        return result;
    })

);

export const getMarshalData = createSelector(
    selectSamplesMainData,
    state => ({
        samples: state.formData,
        meta: state.meta
    })
);

export const hasEntries = createSelector(
    selectFormData,
    state => !!state.length
);

export const hasValidationErrors = createSelector(
    selectFormData,
    state => !!state.length
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
            const unmarshalledData: SampleSet = action.payload;
            return {
                ...state, ...{
                    formData: [...unmarshalledData.samples],
                    importedFile: {
                        fileName: unmarshalledData.meta.fileName || '',
                        data: unmarshalledData.samples.map(getDataValuesFromAnnotatedData)
                    },
                    meta: unmarshalledData.meta
                }
            };
        case ValidateSamplesActionTypes.ValidateSamplesSuccess:
            const mergedEntries: SampleData[] = action.payload.map(
                (sample, i) => {
                    const result: SampleData = { ...sample };
                    Object.keys(result).forEach(prop => {
                        if (state.formData[i][prop].oldValue && !result[prop].oldValue) {
                            result[prop].oldValue = state.formData[i][prop].oldValue;
                        }
                    });
                    return result;

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

                const newEntries = state.formData.map((sampleData: SampleData, i: number) => {

                    const newData = { ...sampleData };

                    if (i === rowIndex) {

                        newData[columnId] = {
                            ...sampleData[columnId], ...{
                                value: newValue
                            }
                        };
                        if (state.importedFile) {
                            if (newValue === state.importedFile.data[i][columnId]) {
                                delete newData[columnId].oldValue;
                            } else {
                                newData[columnId].oldValue = state.importedFile.data[i][columnId];
                            }
                        }

                        newData[columnId].errors = [];
                        newData[columnId].correctionOffer = [];
                    }

                    return newData;
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

function getDataValuesFromAnnotatedData(sampleData: SampleData): SamplePropertyValues {
    const result: SamplePropertyValues = {};
    Object.keys(sampleData).forEach(prop => result[prop] = sampleData[prop].value);
    return result;
}
