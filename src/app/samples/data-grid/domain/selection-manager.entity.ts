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

    constructor(private readonly changeDetector: DataGridChangeDetector) {
        this.anchor = new DataGridCellTool(changeDetector);
        this.selector = new DataGridCellTool(changeDetector);
    }

    startSelection(row: number, col: number, isColHeader: boolean, isRowHeader: boolean, rowCount: number, colCount: number): void {
        if (this.hasSelection) {
            this.markDirtyAll();
        }
        this.anchor.set(row, col);
        this.selector.set(row, col);
        this.isAnchorOnColHeader = isColHeader;
        this.isAnchorOnRowHeader = isRowHeader;
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.markDirtyAll();
    }

    select(row: number, col: number): void {
        const oldFirstRow = this.firstRow;
        const oldLastRow = this.lastRow;
        const oldFirstCol = this.firstCol;
        const oldLastCol = this.lastCol;

        this.selector.set(row, col);

        const markDirtyRows = (minRow: number, maxRow: number) => {
            this.markDirtyRange(
                minRow,
                maxRow,
                Math.min(this.firstCol, oldFirstCol),
                Math.max(this.lastCol, oldLastCol)
            );
            this.markDirtyRowHints(minRow, maxRow);
        };

        const markDirtyCols = (minCol: number, maxCol: number) => {
            this.markDirtyRange(
                Math.min(this.firstRow, oldFirstRow),
                Math.max(this.lastRow, oldLastRow),
                minCol,
                maxCol
            );
            this.markDirtyColHints(minCol, maxCol);
        };

        const markDirtyPart = (
            first1: number,
            first2: number,
            last1: number,
            last2: number,
            dirtyFunc: (min: number, max: number) => void
        ) => {
            dirtyFunc(Math.min(first1, first2), Math.max(first1, first2) - 1);
            dirtyFunc(Math.min(last1, last2) + 1, Math.max(last1, last2));
        };

        markDirtyPart(this.firstRow, oldFirstRow, this.lastRow, oldLastRow, markDirtyRows);
        markDirtyPart(this.firstCol, oldFirstCol, this.lastCol, oldLastCol, markDirtyCols);
    }

    clear(): void {
        if (this.hasSelection) {
            this.markDirtyAll();
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

    private markDirtyAll(): void {
        this.markDirtyRange(this.firstRow, this.lastRow, this.firstCol, this.lastCol);
        this.markDirtyRowHints(this.firstRow, this.lastRow);
        this.markDirtyColHints(this.firstCol, this.lastCol);
    }

    private markDirtyRange(minRow: number, maxRow: number, minCol: number, maxCol: number): void {
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                this.changeDetector.markDirty(row, col);
            }
        }
    }

    private markDirtyRowHints(minRow: number, maxRow: number): void {
        for (let row = minRow; row <= maxRow; row++) {
            this.changeDetector.markDirty(row, 0);
        }
    }

    private markDirtyColHints(minCol: number, maxCol: number): void {
        for (let col = minCol; col <= maxCol; col++) {
            this.changeDetector.markDirty(0, col);
        }
    }
}
