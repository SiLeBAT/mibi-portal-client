import { WorkSheet } from 'xlsx/types';

export type SampleData = Record<string, string>;
export type ChangedValueCollection = Record<string, string>;
export const VALID_SHEET_NAME: string = 'Einsendeformular';

export const CURRENT_HEADERS: string[] = [
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

export interface IExcelFileBlob {
    blob: Blob;
    fileName: string;
}

export interface IImportedExcelFileDetails {
    workSheet: WorkSheet;
    isVersion14: boolean;
    file: File;
    oriDataLength: number;
}

export interface ISampleSheet {
    formData: IAnnotatedSampleData[];
    workSheet: IImportedExcelFileDetails | null;
}

export interface IExcelData {
    data: SampleData[];
    workSheet: IImportedExcelFileDetails;
}

interface IValidationError {
    code: number;
    level: number;
    message: string;
}

export interface IValidationErrorCollection {
    [key: string]: IValidationError[];
}

export interface IAutoCorrectionEntry {
    field: keyof SampleData;
    original: string;
    corrected: string;
}
export interface IAnnotatedSampleData {
    data: SampleData;
    errors: IValidationErrorCollection;
    edits: ChangedValueCollection;
    corrections: IAutoCorrectionEntry[];
}

export interface IChangedField {
    rowIndex: number;
    columnId: string;
    newValue: string;
    originalValue: string;
}

export interface IStatusComments {
    [status: number]: string[];
}

export interface IErrCol {
    [errCol: number]: IStatusComments;
}

export interface IErrRow {
    [errRow: number]: IErrCol;
}

export interface IColConfig {
    id: string;
    title: string;
}

export interface ITableDataOutput {
    data: SampleData[];
    touched: boolean;
    changed: IChangedDataGridField;
}

interface IChangedDataGridField {
    rowIndex: number;
    columnId: string;
    originalValue: string;
    newValue: string;
}
