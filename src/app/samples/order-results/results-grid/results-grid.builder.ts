import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { DataGridMap, DataGridRowId } from '../../data-grid/data-grid.model';
import { SamplesGridCellData, SamplesGridCellViewModel, SamplesGridViewModel } from '../../samples-grid/samples-grid.model';
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
    const cellModels: DataGridMap<SamplesGridCellViewModel> = { [model.headerRowId]: {} };
    const cellData: DataGridMap<SamplesGridCellData> = { [model.headerRowId]: {} };

    model.columns.forEach(column => {
        cellModels[model.headerRowId][column.colId] = {
            isRowHeader: column.isRowHeader,
            isColHeader: true,
            isReadOnly: true,
            cellTemplateId: column.headerCellType ?? model.headerCellType
        };
        cellData[model.headerRowId][column.colId] = column.getHeaderData
            ? column.getHeaderData()
            : column.headerText;
    });

    samples.forEach((sample, index) => {
        const rowId = model.getSampleRowId(index);
        rows.push(rowId);
        cellModels[rowId] = {};
        cellData[rowId] = {};

        model.columns.forEach(column => {
            cellModels[rowId][column.colId] = {
                isRowHeader: column.isRowHeader,
                isColHeader: false,
                isReadOnly: true,
                cellTemplateId: column.cellType
            };
            cellData[rowId][column.colId] = column.getData(sample, index);
        });
    });

    return { rows: rows, cols: cols, cellModels: cellModels, cellData: cellData };
}
