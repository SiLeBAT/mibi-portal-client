import {
    Component,
    ChangeDetectionStrategy,
    Input,
    TemplateRef,
    Output,
    EventEmitter,
    ChangeDetectorRef
} from '@angular/core';
import {
    DataGridCellViewModel,
    DataGridCellData,
    DataGridEditorContext,
    DataGridEditorData
} from '../data-grid.model';
import { DataGridCellController } from '../domain/cell-controller.model';
import { DataGridCellTool } from '../domain/cell-tool.entity';

@Component({
    selector: 'mibi-data-grid-editor-view',
    templateUrl: './editor-view.component.html',
    styleUrls: ['./editor-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridEditorViewComponent {

    @Input() controller: DataGridCellController;

    @Output() dataChange = new EventEmitter<DataGridEditorData>();
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    // TEMPLATE PROPERTIES

    get isActive(): boolean {
        return this.editor.isActive;
    }

    get clientRect(): ClientRect {
        return this.controller.getClientRect(this.editor.row, this.editor.col);
    }

    // TEMPLATE OUTLET PROPERTIES

    get editorTemplate(): TemplateRef<DataGridEditorContext> | undefined {
        const templateId = this.model.editorTemplateId;
        if (templateId === undefined) {
            return undefined;
        }
        return this.controller.getEditorTemplate(templateId);
    }

    get editorContext(): DataGridEditorContext {
        return {
            model: this.model,
            data: this.data,
            requestChangeDetection: () => { this.changeDetectorRef.detectChanges(); },
            dataChange: (data) => { this.dataChange.emit(data); },
            confirm: () => { this.confirm.emit(); },
            cancel: () => { this.cancel.emit(); }
        };
    }

    // PRIVATE PROPERTIES

    private get editor(): DataGridCellTool { return this.controller.editor; }

    private get model(): DataGridCellViewModel { return this.controller.getCellModel(this.editor.row, this.editor.col); }
    private get data(): DataGridCellData { return this.controller.getCellData(this.editor.row, this.editor.col); }

    // LIFE CYCLE

    constructor(private changeDetectorRef: ChangeDetectorRef) {}
}
