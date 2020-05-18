import {
    Component,
    ChangeDetectionStrategy,
    Input,
    TemplateRef,
    Output,
    EventEmitter
} from '@angular/core';
import {
    DataGridCellViewModel,
    DataGridCellData,
    DataGridEditorContext,
    DataGridEditorData,
    DataGridTemplateMap
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

    get foo() {
        // console.log('grid-editor');
        return '';
    }

    @Input() controller: DataGridCellController;
    @Input() templateMap: DataGridTemplateMap<DataGridEditorContext>;

    @Output() mouseEvent = new EventEmitter<MouseEvent>();

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
        if (this.model.editorTemplateId === undefined) {
            return undefined;
        }
        return this.templateMap[this.model.editorTemplateId];
    }

    get editorContext(): DataGridEditorContext {
        return {
            model: this.model,
            data: this.data,
            dataChange: (data) => this.dataChange.emit(data),
            confirm: () => this.confirm.emit(),
            cancel: () => this.cancel.emit()
        };
    }

    // PRIVATE PROPERTIES

    private get editor(): DataGridCellTool { return this.controller.editor; }

    private get model(): DataGridCellViewModel { return this.controller.getCellModel(this.editor.row, this.editor.col); }
    private get data(): DataGridCellData { return this.controller.getCellData(this.editor.row, this.editor.col); }

    // EVENT HANDLERS

    onMouseEvent(e: MouseEvent): void {
        this.mouseEvent.emit(e);
    }
}
