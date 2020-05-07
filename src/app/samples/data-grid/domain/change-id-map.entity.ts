import { Observable, Subject } from 'rxjs';
import { DataGridRowId, DataGridColId, DataGridMap } from '../data-grid.model';
import { DataGridChangeId } from './cell-controller.model';

type ChangeId$Map = DataGridMap<Subject<DataGridChangeId>>;

export class DataGridChangeId$Map {
    private map: ChangeId$Map = {};

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

    getChangeId$(rowId: DataGridRowId, colId: DataGridColId): Observable<DataGridChangeId> {
        return this.map[rowId][colId];
    }

    emitChangeId(rowId: DataGridRowId, colId: DataGridColId, changeId: DataGridChangeId): void {
        this.map[rowId][colId].next(changeId);
    }

    private updateRow(rowId: DataGridRowId, cols: DataGridColId[], oldMap: ChangeId$Map): void {
        this.map[rowId] = {};
        cols.forEach(colId => {
            if (oldMap[rowId][colId]) {
                this.map[rowId][colId] = oldMap[rowId][colId];
            } else {
                this.map[rowId][colId] = new Subject<DataGridChangeId>();
            }
        });
    }

    private createRow(rowId: DataGridRowId, cols: DataGridColId[]): void {
        this.map[rowId] = {};
        cols.forEach(colId => {
            this.map[rowId][colId] = new Subject<DataGridChangeId>();
        });
    }
}
