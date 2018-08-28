import { WorkSheet } from 'xlsx/types';

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

interface IErrorDTO {
    code: number;
    level: number;
    message: string;
}

export interface IErrorResponseDTO {
    [key: string]: IErrorDTO[];
}

export interface IAutoCorrectionDTO {
    corrected: string;
    field: string;
    original: string;
}

export interface IAnnotatedSampleData {
    data: Record<string, string>;
    errors: IErrorResponseDTO;
    corrections: IAutoCorrectionDTO[];
}
