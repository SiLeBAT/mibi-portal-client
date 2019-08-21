import { SampleData } from './../model/sample-management.model';
import { SamplesMainAction, SamplesMainActionTypes } from './samples.actions';
import {
    SamplePropertyValues,
    Sample,
    SampleSetMetaData,
    SampleSet
} from '../model/sample-management.model';
import { ValidateSamplesAction } from '../validate-samples/validate-samples.actions';
import { Urgency, NRL } from '../model/sample.enums';
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
    formData: Sample[];
    importedFile: ImportedFile | null;
    meta: SampleSetMetaData;
}

const initialMainData: SamplesMainData = {
    formData: [],
    importedFile: null,
    meta: {
        nrl: NRL.UNKNOWN,
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
                        data: unmarshalledData.samples.map(
                            sample => {
                                return getDataValuesFromAnnotatedData(sample.sampleData);
                            }
                        )
                    },
                    meta: unmarshalledData.meta
                }
            };
        case SamplesMainActionTypes.UpdateSampleDataSOA:
            const mergedEntries: Sample[] = action.payload.map(
                (sample, i) => {
                    const entry: Sample = state.formData[i];
                    const result: Sample = { ...sample };
                    Object.keys(result.sampleData).forEach(prop => {
                        if (entry.sampleData[prop].oldValue && !result.sampleData[prop].oldValue) {
                            result.sampleData[prop].oldValue = entry.sampleData[prop].oldValue;
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

                const newEntries = state.formData.map((sampleEntry: Sample, i: number) => {

                    const newData: Sample = { ...sampleEntry };

                    if (i === rowIndex) {

                        newData.sampleData[columnId] = {
                            ...sampleEntry.sampleData[columnId], ...{
                                value: newValue
                            }
                        };
                        if (state.importedFile) {
                            if (newValue === state.importedFile.data[i][columnId]) {
                                delete newData.sampleData[columnId].oldValue;
                            } else {
                                newData.sampleData[columnId].oldValue = state.importedFile.data[i][columnId];
                            }
                        }

                        newData.sampleData[columnId].errors = [];
                        newData.sampleData[columnId].correctionOffer = [];
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
