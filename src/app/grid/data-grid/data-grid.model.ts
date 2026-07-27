import { TemplateRef } from '@angular/core';

export type DataGridTemplateId = number;

export interface DataGridCellViewModel<
    TCellTemplateId extends DataGridTemplateId = DataGridTemplateId,
    TEditorTemplateId extends DataGridTemplateId = DataGridTemplateId
> {
    readonly isReadOnly: boolean;
    readonly isColHeader: boolean;
    readonly isRowHeader: boolean;
    readonly cellTemplateId: TCellTemplateId;
    readonly editorTemplateId?: TEditorTemplateId;
}

export type DataGridRowId = number;
export type DataGridColId = number;

export type DataGridCellData = unknown;
export type DataGridEditorData = unknown;

export type DataGridRowMap<T> = Record<DataGridColId, T>;
export type DataGridMap<T> = Record<DataGridRowId, DataGridRowMap<T>>;

export interface DataGridViewModel<
    TCellModel extends DataGridCellViewModel = DataGridCellViewModel,
    TCellData = DataGridCellData
> {
    readonly rows: DataGridRowId[];
    readonly cols: DataGridColId[];
    readonly cellModels: DataGridMap<TCellModel>;
    readonly cellData: DataGridMap<TCellData>;
}

export interface DataGridCellContext {
    readonly model: DataGridCellViewModel;
    readonly data: DataGridCellData;
    requestChangeDetection(): void;
}

export interface DataGridEditorContext extends DataGridCellContext {
    dataChange(data: DataGridEditorData): void;
    confirm(): void;
    cancel(): void;
}

export type DataGridTemplateMap<
    TContext extends DataGridCellContext | DataGridEditorContext,
    TId extends DataGridTemplateId = DataGridTemplateId
> = Record<TId, TemplateRef<TContext>>;

export interface DataGridEditorEvent<TEditorData = DataGridEditorData> {
    rowId: DataGridRowId;
    colId: DataGridColId;
    data: TEditorData | undefined;
}
