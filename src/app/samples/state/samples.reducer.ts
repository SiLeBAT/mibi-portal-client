import { SamplesMainAction, SamplesMainActionTypes } from './samples.actions';
import {
    SamplePropertyValues,
    SampleData,
    SampleSetMetaData,
    SampleSet
} from '../model/sample-management.model';
import { ValidateSamplesAction } from '../validate-samples/validate-samples.actions';
import { Urgency } from '../model/sample.enums';
import { getDataValuesFromAnnotatedData } from './samples.selectors';

// STATE

export interface SamplesMainState {
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

const initialMainData: SamplesMainData = {
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

// REDUCER

export function samplesMainReducer(
    state: SamplesMainData = initialMainData, action: SamplesMainAction | ValidateSamplesAction
): SamplesMainData {
    switch (action.type) {
        case SamplesMainActionTypes.DestroySampleSetSOA:
            return { ...initialMainData };
        case SamplesMainActionTypes.UpdateSampleSetSOA:
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
        case SamplesMainActionTypes.UpdateSampleDataSOA:
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
        case SamplesMainActionTypes.UpdateSampleDataEntrySOA:
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
