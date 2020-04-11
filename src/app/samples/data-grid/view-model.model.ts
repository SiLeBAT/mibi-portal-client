interface UID {
    uId: number;
}

export interface DataGridCellViewModel extends UID {
    value: string;

    isColHeader: boolean;
    isRowHeader: boolean;

    isReadOnly: boolean;
}

export interface DataGridRowViewModel extends UID {
    cols: DataGridCellViewModel[];
}

export interface DataGridViewModel {
    rows: DataGridRowViewModel[];
    rowCount: number;
    colCount: number;
}

export interface DataGridCellDataEvent {
    readonly row: number;
    readonly col: number;
    readonly rowId: number;
    readonly colId: number;

    readonly value: string;
    readonly oldValue: string;
}
