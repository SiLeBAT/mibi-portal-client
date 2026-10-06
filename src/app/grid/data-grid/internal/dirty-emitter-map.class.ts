import { Subject } from 'rxjs';
import { DataGridRowId, DataGridColId, DataGridMap, DataGridRowMap } from '../data-grid.model';
import { DataGridDirtyEmitter } from './cell-controller.model';

type DirtyEmitterMap = DataGridMap<Subject<void>>;
type DirtyEmitterRow = DataGridRowMap<Subject<void>>;

export class DataGridDirtyEmitterMap {
    private map: DirtyEmitterMap = {};

    init(rows: DataGridRowId[], cols: DataGridColId[]): void {
        this.map = {};
        rows.forEach(rowId => {
            this.createRow(rowId, cols);
        });
    }

    update(rows: DataGridRowId[], cols: DataGridColId[], colsChanged: boolean): void {
        const oldMap = this.map;
        this.map = {};

        rows.forEach(rowId => {
            const oldRow = oldMap[rowId];
            if (oldRow) {
                if (colsChanged) {
                    this.updateRow(rowId, cols, oldRow);
                } else {
                    this.map[rowId] = oldRow;
                }
            } else {
                this.createRow(rowId, cols);
            }
        });
    }

    getDirtyEmitter(rowId: DataGridRowId, colId: DataGridColId): DataGridDirtyEmitter {
        return this.cell(rowId, colId);
    }

    emit(rowId: DataGridRowId, colId: DataGridColId): void {
        this.cell(rowId, colId).next();
    }

    // init()/update() populate every rendered cell up front. A lookup that
    // still misses would be a cell the grid never announced, so materialise it
    // rather than hand the template an emitter that is not there.
    private cell(rowId: DataGridRowId, colId: DataGridColId): Subject<void> {
        const row: DirtyEmitterRow = (this.map[rowId] ??= {});
        return (row[colId] ??= new Subject<void>());
    }

    private updateRow(rowId: DataGridRowId, cols: DataGridColId[], oldRow: DirtyEmitterRow): void {
        const row: DirtyEmitterRow = {};
        cols.forEach(colId => {
            row[colId] = oldRow[colId] ?? new Subject<void>();
        });
        this.map[rowId] = row;
    }

    private createRow(rowId: DataGridRowId, cols: DataGridColId[]): void {
        const row: DirtyEmitterRow = {};
        cols.forEach(colId => {
            row[colId] = new Subject<void>();
        });
        this.map[rowId] = row;
    }
}
