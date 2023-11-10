
import { Urgency, NRL } from './sample.enums';

export type SampleProperty = keyof SampleData;
export type SamplePropertyValues = Record<SampleProperty, string>;
export type SampleAutoCorrection = Record<SampleProperty, string>;
export type SampleEdits = Record<SampleProperty, string>;

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

export interface MetaDataCollection {
    [nrl: string]: Partial<SampleMeta>;
}

export interface Analysis {
    species: boolean;
    serological: boolean;
    resistance: boolean;
    vaccination: boolean;
    molecularTyping: boolean;
    toxin: boolean;
    esblAmpCCarbapenemasen: boolean;
    sample: boolean;
    other: string;
    compareHuman: {
        value: string;
        active: boolean;
    };
}

export interface SampleSetMetaData {
    sender: Address;
    fileName: string;
    customerRefNumber: string;
    signatureDate: string;
    version: string;
}

export interface SampleSet {
    samples: Sample[];
    meta: SampleSetMetaData;
}

export enum SampleValidationErrorLevel {
    ERROR = 2,
    WARNING = 1,
    AUTOCORRECTED = 4
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

export interface SampleMeta {
    nrl: NRL;
    analysis: Partial<Analysis>;
    urgency: Urgency;
}
export interface Sample {
    sampleData: SampleData;
    sampleMeta: SampleMeta;
}

export interface SampleData {
    sample_id: AnnotatedSampleDataEntry;
    sample_id_avv: AnnotatedSampleDataEntry;
    partial_sample_id: AnnotatedSampleDataEntry;
    pathogen_avv: AnnotatedSampleDataEntry;
    pathogen_text: AnnotatedSampleDataEntry;
    sampling_date: AnnotatedSampleDataEntry;
    isolation_date: AnnotatedSampleDataEntry;
    sampling_location_avv: AnnotatedSampleDataEntry;
    sampling_location_zip: AnnotatedSampleDataEntry;
    sampling_location_text: AnnotatedSampleDataEntry;
    animal_avv: AnnotatedSampleDataEntry;
    matrix_avv: AnnotatedSampleDataEntry;
    animal_matrix_text: AnnotatedSampleDataEntry;
    primary_production_avv: AnnotatedSampleDataEntry;
    control_program_avv: AnnotatedSampleDataEntry;
    sampling_reason_avv: AnnotatedSampleDataEntry;
    program_reason_text: AnnotatedSampleDataEntry;
    operations_mode_avv: AnnotatedSampleDataEntry;
    operations_mode_text: AnnotatedSampleDataEntry;
    vvvo: AnnotatedSampleDataEntry;
    comment: AnnotatedSampleDataEntry;
}

export interface ChangedDataGridField {
    rowIndex: number;
    columnId: keyof SampleData;
    newValue: string;
}

export interface ExcelFile {
    file: File;
}

export interface MarshalledData {
    binaryData: string;
    fileName: string;
    mimeType: string;
}

export enum ReceiveAs {
    EXCEL,
    PDF
}

export interface SampleSubmission {
    order: SampleSet;
    comment: string;
    receiveAs: ReceiveAs;
}
