import * as _ from 'lodash';
import {
    samplesDestroyMainDataSOA,
    samplesUpdateSampleDataEntrySOA,
    samplesUpdateSampleMetaDataSOA,
    samplesUpdateMainDataSOA,
    samplesUpdateSamplesSOA
} from './samples.actions';
import {
    SamplePropertyValues,
    Sample,
    SampleSetMetaData,
    SampleSet,
    MetaDataCollection,
    ChangedDataGridField,
    AnnotatedSampleDataEntry,
    SampleData
} from '../model/sample-management.model';
import { getDataValuesFromAnnotatedData } from './samples.selectors';
import { createReducer, on } from '@ngrx/store';

// STATE

export interface SamplesMainState {
    mainData: SamplesMainData;
}

export interface ImportedFile {
    fileName: string;
    data: SamplePropertyValues[];
}
export interface SamplesMainData {
    sampleData: Sample[];
    importedFile: ImportedFile | null;
    meta: SampleSetMetaData;
}

const initialMainData: SamplesMainData = {
    sampleData: [],
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
        fileName: '',
        customerRefNumber: '',
        signatureDate: ''
    }

};

// REDUCER

export const samplesMainReducer = createReducer(
    initialMainData,
    on(samplesUpdateSampleMetaDataSOA, (state, action) => ({
        ...state,
        sampleData: updateSampleDataFromMetaData(state.sampleData, action.metaData)
    })),
    on(samplesDestroyMainDataSOA, state => initialMainData),
    on(samplesUpdateMainDataSOA, (state, action) => updateMainDataFromSampleSet(action.sampleSet)),
    on(samplesUpdateSamplesSOA, (state, action) => ({
        ...state,
        sampleData: updateSampleDataFromSamples(state.sampleData, action.samples)
    })),
    on(samplesUpdateSampleDataEntrySOA, (state, action) => {
        const { newValue, rowIndex, columnId } = action.changedField;
        const oldEntry = state.sampleData[rowIndex].sampleData[columnId];
        if (oldEntry.value === newValue) {
            return state;
        }

        const newEntry = updateSampleDataEntryFromChangedData(
            oldEntry,
            state.importedFile,
            action.changedField
        );

        return {
            ...state,
            sampleData: state.sampleData.map((sample, i) => {
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
    })
);

function updateSampleDataFromMetaData(samples: Sample[], metaData: MetaDataCollection): Sample[] {
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
        sampleData: sampleSet.samples,
        importedFile: {
            fileName: sampleSet.meta.fileName || '',
            data: sampleSet.samples.map(
                sample => getDataValuesFromAnnotatedData(sample.sampleData)
            )
        },
        meta: sampleSet.meta
    };
}

function updateSampleDataFromSamples(oldSamples: Sample[], newSamples: Sample[]): Sample[] {
    return newSamples.map((newSample, i) => {
        const oldSample = oldSamples[i];
        newSample = _.cloneDeep(newSample);
        Object.keys(newSample.sampleData).forEach((prop: keyof SampleData) => {
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
