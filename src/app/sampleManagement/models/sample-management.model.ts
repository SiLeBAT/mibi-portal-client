import { WorkSheet } from 'xlsx/types';

export type SampleData = Record<string, string>;
export type ChangedValueCollection = Record<string, string>;
export interface IWorkSheet {
    workSheet: WorkSheet;
    isVersion14: boolean;
    file: File;
    oriDataLength: number;
    validSheetName: string;
}

export interface ISampleSheet {
    entries: IAnnotatedSampleData[];
    workSheet: IWorkSheet | null;
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
