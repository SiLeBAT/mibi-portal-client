import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { DataGridColId, DataGridRowId } from '../../../grid/data-grid/data-grid.model';
import { SamplesGridCellData, SamplesGridCellType } from '../../../grid/samples-grid/samples-grid.model';

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
    // Optional overrides for the header (column-header) cell. Used by the toggle
    // column, whose header is a bar cell rather than the default text header.
    headerCellType?: SamplesGridCellType;
    getHeaderData?(): SamplesGridCellData;
    // When true the column takes an equal fraction (1fr) of the remaining width,
    // so the BfR result columns always span to the end of the page. Other columns
    // keep their content width (auto).
    fill?: boolean;
    // Explicit grid track sizing for this column, overriding the fill/auto default
    // (e.g. the narrow row-number column). Any grid-template-columns track value.
    width?: string;
}

export interface ResultsGridModel {
    columns: ResultsGridColumnModel[];
    headerRowId: DataGridRowId;
    headerCellType: SamplesGridCellType;
    getSampleRowId(index: number): DataGridRowId;
}
