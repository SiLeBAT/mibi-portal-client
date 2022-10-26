import { Subject } from 'rxjs';
import { DataGridRowId, DataGridColId, DataGridMap } from '../data-grid.model';
import { DataGridDirtyEmitter } from './cell-controller.model';

type DirtyEmitterMap = DataGridMap<Subject<void>>;

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
            if (oldMap[rowId]) {
                if (colsChanged) {
                    this.updateRow(rowId, cols, oldMap);
                } else {
                    this.map[rowId] = oldMap[rowId];
                }
            } else {
                this.createRow(rowId, cols);
            }
        });
    }

    getDirtyEmitter(rowId: DataGridRowId, colId: DataGridColId): DataGridDirtyEmitter {
        return this.map[rowId][colId];
    }

    emit(rowId: DataGridRowId, colId: DataGridColId): void {
        this.map[rowId][colId].next();
    }

    private updateRow(rowId: DataGridRowId, cols: DataGridColId[], oldMap: DirtyEmitterMap): void {
        this.map[rowId] = {};
        cols.forEach(colId => {
            if (oldMap[rowId][colId]) {
                this.map[rowId][colId] = oldMap[rowId][colId];
            } else {
                this.map[rowId][colId] = new Subject<void>();
            }
        });
    }

    private createRow(rowId: DataGridRowId, cols: DataGridColId[]): void {
        this.map[rowId] = {};
        cols.forEach(colId => {
            this.map[rowId][colId] = new Subject<void>();
        });
    }
}
