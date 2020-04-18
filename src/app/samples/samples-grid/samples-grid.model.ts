import { Sample, AnnotatedSampleDataEntry } from '../model/sample-management.model';

export enum SamplesGridColumnType {
    ID, NRL, DATA
}

export interface SamplesGridColumnModel {
    colId: number;
    type: SamplesGridColumnType;
    isRowHeader: boolean;
    isReadOnly: boolean;
    headerText: string;
}

export interface SamplesGridIdModel extends SamplesGridColumnModel {
    getId(rowId: number): string;
}

export interface SamplesGridNrlModel extends SamplesGridColumnModel {
    getNrl(sample: Sample): string;
}

export interface SamplesGridDataModel extends SamplesGridColumnModel {
    selector: string;
    getData(sample: Sample): AnnotatedSampleDataEntry;
}

export interface SamplesGridModel {
    columns: SamplesGridColumnModel[];
    headerRowId: number;
    getSampleRowId(index: number): number;
    getSampleIndex(rowId: number): number;
}
