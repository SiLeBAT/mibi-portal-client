import { AnnotatedSampleDataEntry, Sample, SampleData } from '../model/sample-management.model';
import { DataGridRowId, DataGridColId } from '../data-grid/data-grid.model';
import { SamplesGridCellType, SamplesGridEditorType } from '../samples-grid/samples-grid.model';

export interface SamplesEditorColumnModel {
    colId: DataGridColId;
    cellType: SamplesGridCellType;
    editorType?: SamplesGridEditorType;
    isRowHeader: boolean;
    isReadOnly: boolean;
    headerText: string;
    getData(sample: Sample, sampleIndex: number): string | AnnotatedSampleDataEntry;
}

export interface SamplesEditorDataColumnModel extends SamplesEditorColumnModel {
    selector: keyof SampleData;
}

export interface SamplesEditorModel {
    columns: SamplesEditorColumnModel[];
    headerRowId: DataGridRowId;
    headerCellType: SamplesGridCellType;
    getSampleRowId(index: number): DataGridRowId;
    getSampleIndex(rowId: DataGridRowId): number;
}
