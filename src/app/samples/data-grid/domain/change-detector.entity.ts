import { DataGridRowId, DataGridColId, DataGridMap } from '../data-grid.model';
import { DataGridChangeId$Map } from './change-id-map.entity';

export class DataGridChangeDetector {
    private dirtyMarks: true[][] = [];

    constructor(private readonly changeIds: DataGridChangeId$Map) {}

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
                this.changeIds.emitChangeId(rowId, colId, {});
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
