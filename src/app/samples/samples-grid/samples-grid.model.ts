import { DataGridCellViewModel, DataGridViewModel, DataGridEditorEvent } from '../data-grid/data-grid.model';
import { AnnotatedSampleDataEntry } from '../model/sample-management.model';

// Cell types

export enum SamplesGridCellType {
    TEXT,
    DATA,
    // Read-only cell rendering a list of values as aligned stacked lines
    // (used for samples that carry more than one result row).
    STACKED
}

export enum SamplesGridEditorType {
    DATA
}

// Data model

export type SamplesGridTextCellData = string;
export type SamplesGridDataCellData = AnnotatedSampleDataEntry;
export type SamplesGridStackedCellData = string[];
export type SamplesGridCellData = SamplesGridTextCellData | SamplesGridDataCellData | SamplesGridStackedCellData;

export type SamplesGridEditorData = string;

// View model

export type SamplesGridCellViewModel = DataGridCellViewModel<SamplesGridCellType, SamplesGridEditorType>;

export type SamplesGridViewModel = DataGridViewModel<SamplesGridCellViewModel, SamplesGridCellData>;

export interface SamplesGridDataChangeEvent extends DataGridEditorEvent {
    data: SamplesGridEditorData;
}
