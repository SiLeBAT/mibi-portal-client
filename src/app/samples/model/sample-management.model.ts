import { Urgency } from './sample.enums';

export type SampleProperty = keyof SampleData;
export type SamplePropertyValues = Record<SampleProperty, string>;
export type SampleAutoCorrection = Record<SampleProperty, string>;
export type SampleEdits = Record<SampleProperty, string>;

export interface ExcelFileBlob {
    blob: Blob;
    fileName: string;
}

interface Address {
    instituteName: string;
    department?: string;
    street: string;
    zip: string;
    city: string;
    contactPerson: string;
    telephone: string;
    email: string;
}

interface Analysis {
    species: boolean;
    serological: boolean;
    phageTyping: boolean;
    resistance: boolean;
    vaccination: boolean;
    molecularTyping: boolean;
    toxin: boolean;
    zoonosenIsolate: boolean;
    esblAmpCCarbapenemasen: boolean;
    other: string;
    compareHuman: boolean;
}
export interface SampleSetMetaData {
    nrl: string;
    sender: Address;
    analysis: Analysis;
    urgency: Urgency;
    fileName: string;
}

export interface SampleSet {
    samples: SampleData[];
    meta: SampleSetMetaData;
}

export interface SampleValidationError {
    code: number;
    level: number;
    message: string;
}

export interface AnnotatedSampleDataEntry {
    value: string;
    errors: SampleValidationError[];
    correctionOffer: string[];
    oldValue?: string;
}

export interface SampleData {
    sample_id: AnnotatedSampleDataEntry;
    sample_id_avv: AnnotatedSampleDataEntry;
    pathogen_adv: AnnotatedSampleDataEntry;
    pathogen_text: AnnotatedSampleDataEntry;
    sampling_date: AnnotatedSampleDataEntry;
    isolation_date: AnnotatedSampleDataEntry;
    sampling_location_adv: AnnotatedSampleDataEntry;
    sampling_location_zip: AnnotatedSampleDataEntry;
    sampling_location_text: AnnotatedSampleDataEntry;
    topic_adv: AnnotatedSampleDataEntry;
    matrix_adv: AnnotatedSampleDataEntry;
    matrix_text: AnnotatedSampleDataEntry;
    process_state_adv: AnnotatedSampleDataEntry;
    sampling_reason_adv: AnnotatedSampleDataEntry;
    sampling_reason_text: AnnotatedSampleDataEntry;
    operations_mode_adv: AnnotatedSampleDataEntry;
    operations_mode_text: AnnotatedSampleDataEntry;
    vvvo: AnnotatedSampleDataEntry;
    comment: AnnotatedSampleDataEntry;
    [key: string]: AnnotatedSampleDataEntry;
}

export interface ColConfig {
    id: string;
    title: string;
}

export interface TableDataOutput {
    changed: ChangedDataGridField;
}

export interface ChangedDataGridField {
    rowIndex: number;
    columnId: string;
    originalValue: string;
    newValue: string;
}

export interface Einsendebogen {
    file: File;
}

export interface MarshalledData {
    data: string;
    fileName: string;
    type: string;
}

export interface SampleSubmission {
    order: SampleSet;
    comment: string;
}
