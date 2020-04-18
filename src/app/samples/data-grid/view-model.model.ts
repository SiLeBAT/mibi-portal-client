export interface DataGridUIdViewModel {
    uId: number;
}

export interface DataGridCellViewModel extends DataGridUIdViewModel {
    isColHeader: boolean;
    isRowHeader: boolean;

    isReadOnly: boolean;
}

export interface DataGridRowViewModel extends DataGridUIdViewModel {
    cells: DataGridCellViewModel[];
}

export interface DataGridViewModel {
    rows: DataGridRowViewModel[];
    rowCount: number;
    colCount: number;
}

export interface DataGridCellContext {
    rowModel: DataGridRowViewModel;
    cellModel: DataGridCellViewModel;
}

export interface DataGridEditorEvent {
    readonly rowId: number;
    readonly cellId: number;
}
