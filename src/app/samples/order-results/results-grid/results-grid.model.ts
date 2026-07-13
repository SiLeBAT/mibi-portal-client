import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { DataGridColId, DataGridRowId } from '../../data-grid/data-grid.model';
import { SamplesGridCellData, SamplesGridCellType } from '../../samples-grid/samples-grid.model';

/**
 * Column definition for the read-only results grid. Analogous to
 * SamplesEditorColumnModel, but every cell is read-only (no editor) and the
 * data source is the loaded order's SampleWithResultsDTO rather than the
 * editable domain Sample.
 */
export interface ResultsGridColumnModel {
    colId: DataGridColId;
    cellType: SamplesGridCellType;
    isRowHeader: boolean;
    headerText: string;
    getData(sample: SampleWithResultsDTO, sampleIndex: number): SamplesGridCellData;
}

export interface ResultsGridModel {
    columns: ResultsGridColumnModel[];
    headerRowId: DataGridRowId;
    headerCellType: SamplesGridCellType;
    getSampleRowId(index: number): DataGridRowId;
}
