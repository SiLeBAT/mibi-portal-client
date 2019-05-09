import { WorkSheet } from 'xlsx/types';

export type SampleData = Record<string, string>;
export type ChangedValueCollection = Record<string, string>;
export const VALID_SHEET_NAME: string = 'Einsendeformular';

export const FORM_PROPERTIES: string[] = [
    'sample_id',
    'sample_id_avv',
    'pathogen_adv',
    'pathogen_text',
    'sampling_date',
    'isolation_date',
    'sampling_location_adv',
    'sampling_location_zip',
    'sampling_location_text',
    'topic_adv',
    'matrix_adv',
    'matrix_text',
    'process_state_adv',
    'sampling_reason_adv',
    'sampling_reason_text',
    'operations_mode_adv',
    'operations_mode_text',
    'vvvo',
    'comment'
];

export interface ExcelFileBlob {
    blob: Blob;
    fileName: string;
}

export interface ImportedExcelFileDetails {
    workSheet: WorkSheet;
    file: File;
    oriDataLength: number;
}

export interface SampleSheet {
    formData: AnnotatedSampleData[];
    fileDetails: ImportedExcelFileDetails | null;
}

export interface SampleMetaData {
    nrl: string;
}
export interface ExcelData {
    data: SampleData[];
    meta: SampleMetaData;
    fileDetails: ImportedExcelFileDetails;
}

export interface ValidationError {
    code: number;
    level: number;
    message: string;
}

export interface ValidationErrorCollection {
    [key: string]: ValidationError[];
}

export interface AutoCorrectionEntry {
    field: keyof SampleData;
    original: string;
    correctionOffer: string[];
}
export interface AnnotatedSampleData {
    data: SampleData;
    errors: ValidationErrorCollection;
    edits: ChangedValueCollection;
    corrections: AutoCorrectionEntry[];
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
