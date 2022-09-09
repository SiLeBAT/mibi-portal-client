import { DataGridCellViewModel, DataGridViewModel, DataGridEditorEvent } from '../data-grid/data-grid.model';
import { AnnotatedSampleDataEntry } from '../model/sample-management.model';

// Cell types

export enum SamplesGridCellType {
    TEXT,
    DATA
}

export enum SamplesGridEditorType {
    DATA
}

// Data model

export type SamplesGridTextCellData = string;
export type SamplesGridDataCellData = AnnotatedSampleDataEntry;
export type SamplesGridCellData = SamplesGridTextCellData | SamplesGridDataCellData;

export type SamplesGridEditorData = string;

// View model

export type SamplesGridCellViewModel = DataGridCellViewModel<SamplesGridCellType, SamplesGridEditorType>;

export type SamplesGridViewModel = DataGridViewModel<SamplesGridCellViewModel, SamplesGridCellData>;

export interface SamplesGridDataChangeEvent extends DataGridEditorEvent {
    data: SamplesGridEditorData;
}
