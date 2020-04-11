export class DataGridCellTool {
    private _row: number;
    private _col: number;

    get row(): number {
        return this._row;
    }

    get col(): number {
        return this._col;
    }

    constructor(row: number = -1, col: number = -1) {
        this.set(row, col);
    }

    set(row: number, col: number): void {
        this._row = row;
        this._col = col;
    }

    clear(): void {
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

    isActive(): boolean {
        return !this.isOnCell(-1, -1);
    }
}
