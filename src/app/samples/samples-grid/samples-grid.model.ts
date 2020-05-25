import { Sample } from '../model/sample-management.model';
import { DataGridRowId, DataGridColId, DataGridCellData } from '../data-grid/data-grid.model';

export enum SamplesGridCellType {
    TEXT,
    DATA
}

export enum SamplesGridEditorType {
    DATA
}

export interface SamplesGridColumnModel {
    colId: DataGridColId;
    cellType: SamplesGridCellType;
    editorType?: SamplesGridEditorType;
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
    headerCellType: SamplesGridCellType;
    getSampleRowId(index: number): DataGridRowId;
    getSampleIndex(rowId: DataGridRowId): number;
}
