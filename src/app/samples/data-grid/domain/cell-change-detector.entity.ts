import { DataGridRowId, DataGridColId, DataGridMap } from '../data-grid.model';
import { DataGridDirtyEmitterMap } from './dirty-emitter-map.entity';

export class DataGridCellChangeDetector {
    private dirtyMarks: true[][] = [];

    constructor(private readonly dirtyEmitterMap: DataGridDirtyEmitterMap) {}

    markDirty(row: number, col: number): void {
        if (!this.dirtyMarks[row]) {
            this.dirtyMarks[row] = [];
        }
        this.dirtyMarks[row][col] = true;
    }

    markDirtyMap(
        oldMap: DataGridMap<any>,
        newMap: DataGridMap<any>,
        rows: DataGridRowId[],
        cols: DataGridColId[]
    ): void {
        this.checkDirtyMap(oldMap, newMap, rows, (rowId, row) => {
            this.checkDirtyMap(oldMap[rowId], newMap[rowId], cols, (colId, col) => {
                this.markDirty(row, col);
            });
        });
    }

    detectChanges(rows: DataGridRowId[], cols: DataGridColId[]): void {
        this.dirtyMarks.forEach((rowDirtyMarks, row) => {
            rowDirtyMarks.forEach((cellDirtyMark, col) => {
                const rowId = rows[row];
                const colId = cols[col];
                this.dirtyEmitterMap.emit(rowId, colId);
            });
        });
        this.dirtyMarks = [];
    }

    private checkDirtyMap<M, K extends keyof M>(
        oldMap: M,
        newMap: M,
        keys: K[],
        dirtyFunc: (key: K, index: number) => void
    ): void {
        keys.forEach((key, index) => {
            if (oldMap[key]) {
                if (oldMap[key] !== newMap[key]) {
                    dirtyFunc(key, index);
                }
            }
        });
    }
}
