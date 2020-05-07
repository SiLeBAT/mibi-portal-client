import { DataGridCellTool } from './cell-tool.entity';
import { DataGridSelectionManager } from './selection-manager.entity';
import { DataGridCellData, DataGridRowId, DataGridColId, DataGridCellViewModel } from '../data-grid.model';

export type DataGridChangeId = object;

export interface DataGridCellController {
    readonly cursor: DataGridCellTool;
    readonly editor: DataGridCellTool;
    readonly selection: DataGridSelectionManager;
    readonly hover: DataGridSelectionManager;

    getCellModel(row: number, col: number): DataGridCellViewModel;
    getCellData(row: number, col: number): DataGridCellData;

    // REMOVE
    getRowId(row: number): DataGridRowId;
    getColId(col: number): DataGridColId;
}
