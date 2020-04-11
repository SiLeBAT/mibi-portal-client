import { DataGridCellTool } from './cell-tool.entity';

export class DataGridSelectionManager {
    anchor = new DataGridCellTool();
    selector = new DataGridCellTool();

    private isAnchorColHeader = false;
    private isAnchorRowHeader = false;
    private rowCount = 0;
    private colCount = 0;

    startSelection(row: number, col: number, isColHeader: boolean, isRowHeader: boolean, rowCount: number, colCount: number): void {
        this.anchor.set(row, col);
        this.selector.set(row, col);
        this.isAnchorColHeader = isColHeader;
        this.isAnchorRowHeader = isRowHeader;
        this.rowCount = rowCount;
        this.colCount = colCount;
    }

    isSelecting(): boolean {
        return this.anchor.isActive();
    }

    select(row: number, col: number): void {
        this.selector.set(row, col);
    }

    clear(): void {
        this.anchor.clear();
        this.selector.clear();
        this.isAnchorColHeader = false;
        this.isAnchorRowHeader = false;
        this.rowCount = 0;
        this.colCount = 0;
    }

    isSelected(row: number, col: number): boolean {
        return this.isSelecting() && this.hasSelectionInRow(row) && this.hasSelectionInCol(col);
    }

    hasSelectionInRow(row: number): boolean {
        if (this.isAnchorColHeader) {
            return this.isValueInRange(row, this.anchor.row, this.rowCount - 1);
        } else {
            return this.isValueInRange(row, this.anchor.row, this.selector.row);
        }
    }

    hasSelectionInCol(col: number): boolean {
        if (this.isAnchorRowHeader) {
            return this.isValueInRange(col, this.anchor.col, this.colCount - 1);
        } else {
            return this.isValueInRange(col, this.anchor.col, this.selector.col);
        }
    }

    private isValueInRange(v: number, r1: number, r2: number): boolean {
        return v >= Math.min(r1, r2) && v <= Math.max(r1, r2);
    }
}
