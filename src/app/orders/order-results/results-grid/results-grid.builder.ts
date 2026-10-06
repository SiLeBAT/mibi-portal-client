import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { DataGridMap, DataGridRowId, DataGridRowMap } from '../../../grid/data-grid/data-grid.model';
import { SamplesGridCellData, SamplesGridCellViewModel, SamplesGridViewModel } from '../../../grid/samples-grid/samples-grid.model';
import { ResultsGridModel } from './results-grid.model';

/**
 * Builds a fully read-only SamplesGridViewModel from the loaded order's
 * samples, preserving the uploaded row order. No cell carries an
 * editorTemplateId, so the reused data-grid never opens an editor.
 */
export function buildResultsGridViewModel(
    model: ResultsGridModel,
    samples: SampleWithResultsDTO[]
): SamplesGridViewModel {
    const cols = model.columns.map(column => column.colId);
    const rows: DataGridRowId[] = [model.headerRowId];
    const headerModels: DataGridRowMap<SamplesGridCellViewModel> = {};
    const headerData: DataGridRowMap<SamplesGridCellData> = {};

    model.columns.forEach(column => {
        headerModels[column.colId] = {
            isRowHeader: column.isRowHeader,
            isColHeader: true,
            isReadOnly: true,
            cellTemplateId: column.headerCellType ?? model.headerCellType
        };
        headerData[column.colId] = column.getHeaderData
            ? column.getHeaderData()
            : column.headerText;
    });

    const cellModels: DataGridMap<SamplesGridCellViewModel> = { [model.headerRowId]: headerModels };
    const cellData: DataGridMap<SamplesGridCellData> = { [model.headerRowId]: headerData };

    samples.forEach((sample, index) => {
        const rowId = model.getSampleRowId(index);
        rows.push(rowId);
        const rowModels: DataGridRowMap<SamplesGridCellViewModel> = {};
        const rowData: DataGridRowMap<SamplesGridCellData> = {};

        model.columns.forEach(column => {
            rowModels[column.colId] = {
                isRowHeader: column.isRowHeader,
                isColHeader: false,
                isReadOnly: true,
                cellTemplateId: column.cellType
            };
            rowData[column.colId] = column.getData(sample, index);
        });

        cellModels[rowId] = rowModels;
        cellData[rowId] = rowData;
    });

    return { rows: rows, cols: cols, cellModels: cellModels, cellData: cellData };
}
