import { DataGridChangeDetector } from './change-detector.class';

export class DataGridCellTool {
    private _row: number = -1;
    private _col: number = -1;

    get row(): number {
        return this._row;
    }

    get col(): number {
        return this._col;
    }

    get isActive(): boolean {
        return !this.isOnCell(-1, -1);
    }

    constructor(private readonly changeDetector: DataGridChangeDetector) { }

    set(row: number, col: number): void {
        if (this.isActive) {
            this.markDirty();
        }
        this._row = row;
        this._col = col;
        this.markDirty();
    }

    clear(): void {
        if (this.isActive) {
            this.markDirty();
        }
        this._row = -1;
        this._col = -1;
    }

    isOnCell(row: number, col: number): boolean {
        return this.isInRow(row) && this.isInCol(col);
    }

    isInRow(row: number): boolean {
        return this._row === row;
    }

    isInCol(col: number): boolean {
        return this._col === col;
    }

    private markDirty(): void {
        this.changeDetector.markDirty(this._row, this._col);
    }
}
