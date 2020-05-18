import { TemplateRef } from '@angular/core';

export type DataGridTemplateId = number;

export interface DataGridCellViewModel {
    readonly isReadOnly: boolean;
    readonly isColHeader: boolean;
    readonly isRowHeader: boolean;
    readonly cellTemplateId: DataGridTemplateId;
    readonly editorTemplateId?: DataGridTemplateId;
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
}

export interface DataGridEditorContext extends DataGridCellContext {
    dataChange(data: DataGridEditorData): void;
    confirm(): void;
    cancel(): void;
}

export type DataGridTemplateMap<T> = Record<DataGridTemplateId, TemplateRef<T>>;

export interface DataGridEditorEvent {
    rowId: DataGridRowId;
    colId: DataGridColId;
    data: DataGridEditorData | undefined;
}
