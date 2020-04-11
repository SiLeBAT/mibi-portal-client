import * as _ from 'lodash';
import { SamplesMainAction, SamplesMainActionTypes } from './samples.actions';
import {
    SamplePropertyValues,
    Sample,
    SampleSetMetaData,
    SampleSet,
    MetaDataCollection,
    ChangedDataGridField,
    AnnotatedSampleDataEntry
} from '../model/sample-management.model';
import { ValidateSamplesAction } from '../validate-samples/validate-samples.actions';
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
        fileName: ''
    }
};

// REDUCER

export function samplesMainReducer(
    state: SamplesMainData = initialMainData, action: SamplesMainAction | ValidateSamplesAction
): SamplesMainData {
    switch (action.type) {
        case SamplesMainActionTypes.UpdateSampleMetaDataSOA:
            return {
                ...state,
                formData: updateFormDataFromMetaData(state.formData, action.payload)
            };
        case SamplesMainActionTypes.DestroySampleSetSOA:
            return initialMainData;
        case SamplesMainActionTypes.UpdateSampleSetSOA:
            return updateMainDataFromSampleSet(action.payload);
        case SamplesMainActionTypes.UpdateSamplesSOA:
            return {
                ...state,
                formData: updateFormDataFromSamples(state.formData, action.payload)
            };
        case SamplesMainActionTypes.UpdateSampleDataEntrySOA:
            const { newValue, originalValue, rowIndex, columnId } = action.payload;
            if (originalValue === newValue) {
                return state;
            }

            const newEntry = updateSampleDataEntryFromChangedData(
                state.formData[rowIndex].sampleData[columnId],
                state.importedFile,
                action.payload
            );

            return {
                ...state,
                formData: state.formData.map((sample, i) => {
                    if (i === rowIndex) {
                        return {
                            ...sample,
                            sampleData: {
                                ...sample.sampleData,
                                [columnId]: newEntry
                            }
                        };
                    }
                    return sample;
                })
            };
        default:
            return state;
    }
}

function updateFormDataFromMetaData(samples: Sample[], metaData: MetaDataCollection): Sample[] {
    return samples.map(sample => {
        if (metaData[sample.sampleMeta.nrl]) {
            return {
                ...sample,
                sampleMeta: { ...sample.sampleMeta, ...metaData[sample.sampleMeta.nrl] }
            };
        }
        return sample;
    });
}

function updateMainDataFromSampleSet(sampleSet: SampleSet): SamplesMainData {
    return {
        formData: sampleSet.samples,
        importedFile: {
            fileName: sampleSet.meta.fileName || '',
            data: sampleSet.samples.map(
                sample => getDataValuesFromAnnotatedData(sample.sampleData)
            )
        },
        meta: sampleSet.meta
    };
}

function updateFormDataFromSamples(oldSamples: Sample[], newSamples: Sample[]): Sample[] {
    return newSamples.map((newSample, i) => {
        const oldSample = oldSamples[i];
        newSample = _.cloneDeep(newSample);
        Object.keys(newSample.sampleData).forEach(prop => {
            if (oldSample.sampleData[prop].oldValue && !newSample.sampleData[prop].oldValue) {
                newSample.sampleData[prop].oldValue = oldSample.sampleData[prop].oldValue;
            }
        });
        return newSample;
    });
}

function updateSampleDataEntryFromChangedData(
    entry: AnnotatedSampleDataEntry,
    importedFile: ImportedFile | null,
    changedData: ChangedDataGridField
): AnnotatedSampleDataEntry {
    let oldValue = entry.oldValue;
    if (importedFile) {
        const importedValue = importedFile.data[changedData.rowIndex][changedData.columnId];
        oldValue = changedData.newValue === importedValue ? undefined : importedValue;
    }

    return {
        ...entry,
        value: changedData.newValue,
        errors: [],
        correctionOffer: [],
        oldValue: oldValue
    };
}
