import { Component, ChangeDetectionStrategy, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataGridCellContext, DataGridTemplateMap, DataGridEditorContext, DataGridEditorEvent } from '../data-grid/data-grid.model';
import { SamplesGridCellType, SamplesGridDataCellData, SamplesGridDataChangeEvent, SamplesGridEditorData, SamplesGridEditorType, SamplesGridViewModel } from './samples-grid.model';
import { SamplesGridTextCellTemplateComponent } from './internal/cells/text-cell-template.component';
import { SamplesGridDataCellTemplateComponent } from './internal/cells/data-cell-template.component';
import { SamplesGridDataEditorTemplateComponent } from './internal/editors/data-editor-template.component';

@Component({
    selector: 'mibi-samples-grid-view',
    templateUrl: './samples-grid-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridViewComponent implements OnInit {

    @Input() model: SamplesGridViewModel;
    @Output() dataChange = new EventEmitter<SamplesGridDataChangeEvent>();

    cellTemplates: DataGridTemplateMap<DataGridCellContext, SamplesGridCellType>;
    editorTemplates: DataGridTemplateMap<DataGridEditorContext, SamplesGridEditorType>;

    @ViewChild('textCellTemplate', { static: true })
    private textCellTemplate: SamplesGridTextCellTemplateComponent;

    @ViewChild('dataCellTemplate', { static: true })
    private dataCellTemplate: SamplesGridDataCellTemplateComponent;

    @ViewChild('dataEditorTemplate', { static: true })
    private dataEditorTemplate: SamplesGridDataEditorTemplateComponent;

    ngOnInit(): void {
        this.cellTemplates = {
            [SamplesGridCellType.TEXT]: this.textCellTemplate.template,
            [SamplesGridCellType.DATA]: this.dataCellTemplate.template
        };
        this.editorTemplates = {
            [SamplesGridEditorType.DATA]: this.dataEditorTemplate.template
        };
    }

    onEditorConfirm(e: DataGridEditorEvent<SamplesGridEditorData>): void {
        if (e.data === undefined) {
            return;
        }

        const oldData = this.model.cellData[e.rowId][e.colId] as SamplesGridDataCellData;

        if(e.data === oldData.value) {
            return;
        }

        this.dataChange.emit(e as SamplesGridDataChangeEvent);
    }
}
