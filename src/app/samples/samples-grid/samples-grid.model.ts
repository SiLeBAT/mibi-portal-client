import { Sample } from '../model/sample-management.model';
import { DataGridRowId, DataGridColId, DataGridCellData } from '../data-grid/data-grid.model';

export enum SamplesGridColumnType {
    ID, NRL, DATA
}

export interface SamplesGridColumnModel {
    colId: DataGridColId;
    type: SamplesGridColumnType;
    isRowHeader: boolean;
    isReadOnly: boolean;
    headerText: string;
    getData(sample: Sample, sampleIndex: number): DataGridCellData;
}

export interface SamplesGridDataColumnModel extends SamplesGridColumnModel {
    selector: string;
}

export interface SamplesGridModel {
    columns: SamplesGridColumnModel[];
    headerRowId: DataGridRowId;
    getSampleRowId(index: number): DataGridRowId;
    getSampleIndex(rowId: DataGridRowId): number;
}
