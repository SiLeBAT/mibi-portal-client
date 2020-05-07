import { DataGridCellTool } from './cell-tool.entity';
import { DataGridChangeDetector } from './change-detector.entity';

export class DataGridSelectionManager {
    readonly anchor: DataGridCellTool;
    readonly selector: DataGridCellTool;

    isAnchorOnColHeader = false;
    isAnchorOnRowHeader = false;

    get isAnchorHeader(): boolean {
        return this.isAnchorOnColHeader || this.isAnchorOnRowHeader;
    }

    get hasSelection(): boolean {
        return this.anchor.isActive;
    }

    private rowCount = 0;
    private colCount = 0;

    private get firstRow(): number {
        return Math.min(this.anchor.row, this.selector.row);
    }

    private get lastRow(): number {
        if (this.isAnchorOnColHeader) {
            return this.rowCount - 1;
        } else {
            return Math.max(this.anchor.row, this.selector.row);
        }
    }

    private get firstCol(): number {
        return Math.min(this.anchor.col, this.selector.col);
    }

    private get lastCol(): number {
        if (this.isAnchorOnRowHeader) {
            return this.colCount - 1;
        } else {
            return Math.max(this.anchor.col, this.selector.col);
        }
    }

    constructor(private readonly changeManager: DataGridChangeDetector) {
        this.anchor = new DataGridCellTool(changeManager);
        this.selector = new DataGridCellTool(changeManager);
    }

    startSelection(row: number, col: number, isColHeader: boolean, isRowHeader: boolean, rowCount: number, colCount: number): void {
        if (this.hasSelection) {
            this.markDirty();
        }
        this.anchor.set(row, col);
        this.selector.set(row, col);
        this.isAnchorOnColHeader = isColHeader;
        this.isAnchorOnRowHeader = isRowHeader;
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.markDirty();
    }

    select(row: number, col: number): void {
        this.markDirty();
        this.selector.set(row, col);
        this.markDirty();
    }

    clear(): void {
        if (this.hasSelection) {
            this.markDirty();
        }
        this.anchor.clear();
        this.selector.clear();
        this.isAnchorOnColHeader = false;
        this.isAnchorOnRowHeader = false;
        this.rowCount = 0;
        this.colCount = 0;
    }

    isSelected(row: number, col: number): boolean {
        return this.hasSelection && this.hasSelectionInRow(row) && this.hasSelectionInCol(col);
    }

    hasSelectionInRow(row: number): boolean {
        return row >= this.firstRow && row <= this.lastRow;
    }

    hasSelectionInCol(col: number): boolean {
        return col >= this.firstCol && col <= this.lastCol;
    }

    private markDirty(): void {
        for (let row = this.firstRow; row <= this.lastRow; row++) {
            this.changeManager.markDirty(row, 0);
            for (let col = this.firstCol; col <= this.lastCol; col++) {
                this.changeManager.markDirty(row, col);
            }
        }
        for (let col = this.firstCol; col <= this.lastCol; col++) {
            this.changeManager.markDirty(0, col);
        }
    }
}
