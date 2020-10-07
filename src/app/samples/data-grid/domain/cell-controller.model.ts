import { DataGridCellTool } from './cell-tool.entity';
import { DataGridSelectionManager } from './selection-manager.entity';
import {
    DataGridCellData,
    DataGridCellViewModel,
    DataGridTemplateId,
    DataGridCellContext,
    DataGridEditorContext
} from '../data-grid.model';
import { Observable } from 'rxjs';
import { TemplateRef } from '@angular/core';

export type DataGridDirtyEmitter = Observable<void>;

export interface DataGridCellController {
    readonly cursor: DataGridCellTool;
    readonly editor: DataGridCellTool;
    readonly selection: DataGridSelectionManager;
    readonly hover: DataGridSelectionManager;

    getCellModel(row: number, col: number): DataGridCellViewModel;
    getCellData(row: number, col: number): DataGridCellData;
    getClientRect(row: number, col: number): ClientRect;

    getCellTemplate(templateId: DataGridTemplateId): TemplateRef<DataGridCellContext>;
    getEditorTemplate(templateId: DataGridTemplateId): TemplateRef<DataGridEditorContext>;
}
