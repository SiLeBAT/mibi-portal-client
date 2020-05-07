export interface DataGridCellViewModel {
    readonly isReadOnly: boolean;
    readonly isColHeader: boolean;
    readonly isRowHeader: boolean;
}

export type DataGridRowId = number;
export type DataGridColId = number;

export type DataGridCellData = any;
export type DataGridEditorData = any;

export type DataGridRowMap<T> = Record<DataGridColId, T>;
export type DataGridMap<T> = Record<DataGridRowId, DataGridRowMap<T>>;

export interface DataGridViewModel {
    readonly rows: DataGridRowId[];
    readonly cols: DataGridColId[];
    readonly cellModels: DataGridMap<DataGridCellViewModel>;
    readonly cellData: DataGridMap<DataGridCellData>;
}

export interface DataGridCellContext {
    readonly model: DataGridCellViewModel;
    readonly data: DataGridCellData;

    // REMOVE
    readonly rowId: DataGridRowId;
    readonly colId: DataGridColId;
}

export interface DataGridEditorContext extends DataGridCellContext {
    dataChange(data: DataGridEditorData): void;
    confirm(): void;
    cancel(): void;
}

export interface DataGridDataEvent {
    rowId: DataGridRowId;
    colId: DataGridColId;
    data: DataGridEditorData;
}
