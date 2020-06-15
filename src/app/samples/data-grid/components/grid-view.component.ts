import {
    Component,
    HostListener,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    ElementRef,
    ViewChild
} from '@angular/core';
import { DataGridCellTool } from '../domain/cell-tool.entity';
import { DataGridSelectionManager } from '../domain/selection-manager.entity';
import { DataGridClearingManager } from '../domain/clearing-manager.entity';
import {
    DataGridCellViewModel,
    DataGridCellContext,
    DataGridViewModel,
    DataGridRowId,
    DataGridColId,
    DataGridCellData,
    DataGridEditorEvent,
    DataGridEditorData,
    DataGridMap,
    DataGridTemplateMap,
    DataGridEditorContext
} from '../data-grid.model';
import { DataGridCellController, DataGridDirtyEmitter } from '../domain/cell-controller.model';
import { DataGridChangeDetector } from '../domain/change-detector.entity';
import { DataGridDirtyEmitterMap } from '../domain/dirty-emitter-map.entity';
import { Subject } from 'rxjs';

enum MouseButton {
    PRIMARY = 0
}

enum MouseButtons {
    NONE = 0,
    PRIMARY = 1
}

@Component({
    selector: 'mibi-data-grid-view',
    templateUrl: './grid-view.component.html',
    styleUrls: ['./grid-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridViewComponent implements AfterViewInit, OnChanges {

    @Input() model: DataGridViewModel;
    @Input() cellTemplates: DataGridTemplateMap<DataGridCellContext>;
    @Input() editorTemplates: DataGridTemplateMap<DataGridEditorContext>;

    @Output() editorConfirm = new EventEmitter<DataGridEditorEvent>();

    // TEMPLATE PROPERTIES

    readonly cellController: DataGridCellController;

    get rows(): DataGridRowId[] {
        return this.model.rows;
    }
    get cols(): DataGridColId[] {
        return this.model.cols;
    }

    get rowCount(): number {
        return this.model.rows.length;
    }
    get colCount(): number {
        return this.model.cols.length;
    }

    // PRIVATE PROPERTIES

    @ViewChild('grid', { static: true })
    private gridRef: ElementRef;

    private get cellModels(): DataGridMap<DataGridCellViewModel> { return this.model.cellModels; }
    private get cellData(): DataGridMap<DataGridCellData> { return this.model.cellData; }

    private readonly cellDirtyEmitterMap = new DataGridDirtyEmitterMap();
    private readonly cellChangeDetector = new DataGridChangeDetector(this.cellDirtyEmitterMap);
    private readonly editorDirtyEmitter = new Subject<void>();

    private readonly cursor = new DataGridCellTool(this.cellChangeDetector);
    private readonly editor = new DataGridCellTool(this.cellChangeDetector);

    private readonly selection = new DataGridSelectionManager(this.cellChangeDetector);
    private readonly hover = new DataGridSelectionManager(this.cellChangeDetector);
    private readonly clearing = new DataGridClearingManager();

    private editorData: DataGridEditorData = undefined;

    // edge workaround for detecting mouseover event with button pressed
    private isEdgeMouseDownLeft = false;

    // LIFE CYCLE

    constructor(private readonly gridChangeDetector: ChangeDetectorRef) {
        this.cellController = {
            cursor: this.cursor,
            editor: this.editor,
            selection: this.selection,
            hover: this.hover,
            getCellModel: (row, col) => this.getCellModel(row, col),
            getCellData: (row, col) => this.getCellData(row, col),
            getClientRect: (row, col) => this.getClientRect(row, col),
            getCellTemplate: (templateId) => this.cellTemplates[templateId],
            getEditorTemplate: (templateId) => this.editorTemplates[templateId]
        };
    }

    ngAfterViewInit(): void {
        this.gridChangeDetector.detach();
    }

    ngOnChanges(changes: SimpleChanges): void {
        let isGridDirty = false;
        const modelChange = changes.model;
        if (modelChange) {
            const oldModel = modelChange.previousValue as DataGridViewModel;
            const newModel = modelChange.currentValue as DataGridViewModel;

            if (modelChange.firstChange) {
                this.cellDirtyEmitterMap.init(newModel.rows, newModel.cols);
            } else {
                const rowsChanged = oldModel.rows !== newModel.rows;
                const colsChanged = oldModel.cols !== newModel.cols;
                const cellModelsChanged = oldModel.cellModels !== newModel.cellModels;
                const cellDataChanged = oldModel.cellData !== newModel.cellData;

                if (rowsChanged || colsChanged) {
                    this.cellDirtyEmitterMap.update(newModel.rows, newModel.cols, colsChanged);
                }

                if (cellModelsChanged) {
                    this.cellChangeDetector.markDirtyMap(oldModel.cellModels, newModel.cellModels, this.rows, this.cols);
                }

                if (cellDataChanged) {
                    this.cellChangeDetector.markDirtyMap(oldModel.cellData, newModel.cellData, this.rows, this.cols);
                }

                if (rowsChanged || colsChanged || cellModelsChanged) {
                    isGridDirty = true;
                }
            }
        }

        if (changes.cellTemplates && !changes.cellTemplates.firstChange) {
            this.cellChangeDetector.markDirtyRange(this.rows, this.cols);
        }

        if (isGridDirty) {
            this.gridChangeDetector.detectChanges();
            this.cursor.clear();
            this.selection.clear();
        }

        this.hover.clear();

        if (this.editor.isActive) {
            this.cancelEditor();
        }

        this.detectChildChanges();
    }

    // CELL EVENT HANDLERS

    onCellMouseEvent(e: MouseEvent, row: number, col: number): void {
        switch (e.type) {
            case 'mouseover':
                this.onCellMouseOver(e, row, col);
                break;
            case 'mousedown':
                this.onCellMouseDown(e, row, col);
                break;
            case 'click':
                this.onCellClick(e, row, col);
                break;
            case 'mouseup':
                this.onCellMouseUp(e, row, col);
                break;
            case 'mouseout':
                this.onCellMouseOut(e, row, col);
                break;
        }
        this.detectChildChanges();
    }

    // EDITOR EVENT HANDLERS

    onEditorMouseEvent(e: MouseEvent): void {
        if (!this.editor.isActive) {
            return;
        }
        this.onCellMouseEvent(e, this.editor.row, this.editor.col);
    }

    onEditorDataChange(e: DataGridEditorData): void {
        this.editorData = e;
        this.detectChildChanges();
    }

    onEditorConfirm(): void {
        this.startSelection(this.selection, this.editor.row, this.editor.col);
        this.cursor.set(this.editor.row, this.editor.col);
        this.confirmEditor();
        this.detectChildChanges();
    }

    onEditorCancel(): void {
        this.startSelection(this.selection, this.editor.row, this.editor.col);
        this.cursor.set(this.editor.row, this.editor.col);
        this.cancelEditor();
        this.detectChildChanges();
    }

    @HostListener('window:resize', ['$event'])
    onWindowResize(e: UIEvent): void {
        if (!this.editor.isActive) {
            return;
        }
        this.detectChildChanges();
    }

    // CLEARING EVENT HANDLERS

    onGridMouseDown(e: MouseEvent): void {
        if (e.button !== MouseButton.PRIMARY) {
            return;
        }
        this.clearing.clickGrid();
    }

    onContainerMouseDown(e: MouseEvent): void {
        if (e.button !== MouseButton.PRIMARY) {
            return;
        }
        this.clearing.clickContainer();
    }

    onScrollContainerMouseDown(e: MouseEvent): void {
        if (e.button !== MouseButton.PRIMARY) {
            return;
        }
        this.clearing.clickScrollContainer();
    }

    @HostListener('window:mousedown', ['$event'])
    onWindowMouseDown(e: MouseEvent): void {
        if (e.button !== MouseButton.PRIMARY) {
            return;
        }

        if (this.clearing.isDirty) {
            if (this.editor.isActive) {
                this.confirmEditor();
            }
            this.cursor.clear();
            this.selection.clear();
        }
        this.clearing.clear();
        this.detectChildChanges();
    }

    @HostListener('window:mouseup', ['$event'])
    onWindowMouseUp(e: MouseEvent): void {
        this.isEdgeMouseDownLeft = false;
    }

    // TEMPLATE METHODS

    getCellDirtyEmitter(rowId: DataGridRowId, colId: DataGridColId): DataGridDirtyEmitter {
        return this.cellDirtyEmitterMap.getDirtyEmitter(rowId, colId);
    }

    getEditorDirtyEmitter(): DataGridDirtyEmitter {
        return this.editorDirtyEmitter;
    }

    isRowHeader(row: number, col: number): boolean {
        return this.getCellModel(row, col).isRowHeader;
    }
    isColHeader(row: number, col: number): boolean {
        return this.getCellModel(row, col).isColHeader;
    }
    isHeader(row: number, col: number): boolean {
        return this.isRowHeader(row, col) || this.isColHeader(row, col);
    }
    isGridHeader(row: number, col: number): boolean {
        return this.isRowHeader(row, col) && this.isColHeader(row, col);
    }

    // PRIVATE UI EVENT HANDLERS

    private onCellMouseOver(e: MouseEvent, row: number, col: number): void {
        if (e.buttons === MouseButtons.NONE && !this.isEdgeMouseDownLeft) {
            this.startSelection(this.hover, row, col);
        }

        if (e.buttons !== MouseButtons.PRIMARY && !this.isEdgeMouseDownLeft) {
            return;
        }

        if (this.selection.hasSelection) {
            this.cursor.clear();
            this.selection.select(row, col);
        }
    }

    private onCellMouseDown(e: MouseEvent, row: number, col: number): void {
        if (e.button !== MouseButton.PRIMARY) {
            return;
        }

        this.isEdgeMouseDownLeft = true;

        // clear any selected elements to prevent drag and drop behaviour
        const sel = window.getSelection();
        if (sel) {
            sel.empty();
        }

        if (this.editor.isOnCell(row, col)) {
            return;
        }

        if (this.editor.isActive) {
            this.confirmEditor();
        }

        if (!this.cursor.isOnCell(row, col)) {
            this.cursor.clear();
        }

        this.startSelection(this.selection, row, col);
    }

    private onCellClick(e: MouseEvent, row: number, col: number): void {
        if (e.button !== MouseButton.PRIMARY) {
            return;
        }

        if (this.getCellModel(row, col).isReadOnly) {
            return;
        }

        if (this.editor.isOnCell(row, col)) {
            return;
        }

        if (this.cursor.isOnCell(row, col)) {
            this.cursor.clear();
            this.selection.clear();
            this.openEditor(row, col);
            return;
        }

        this.cursor.set(row, col);
    }

    private onCellMouseUp(e: MouseEvent, row: number, col: number): void {
        this.startSelection(this.hover, row, col);
    }

    private onCellMouseOut(e: MouseEvent, row: number, col: number): void {
        if (!this.editor.isActive) {
            this.hover.clear();
        }
    }

    // PRIVATE UI METHODS

    private startSelection(selection: DataGridSelectionManager, row: number, col: number): void {
        const isColHeader = this.isColHeader(row, col);
        const isRowHeader = this.isRowHeader(row, col);
        selection.startSelection(row, col, isColHeader, isRowHeader, this.rowCount, this.colCount);
    }

    private openEditor(row: number, col: number): void {
        this.editor.set(row, col);
    }

    private confirmEditor(): void {
        this.editorConfirm.emit({
            data: this.editorData,
            rowId: this.rows[this.editor.row],
            colId: this.cols[this.editor.col]
        });
        this.cancelEditor();
    }

    private cancelEditor(): void {
        this.editor.clear();
        this.editorData = undefined;
    }

    // PRIVATE UTILITY METHODS

    private getCellModel(row: number, col: number): DataGridCellViewModel {
        return this.cellModels[this.rows[row]][this.cols[col]];
    }
    private getCellData(row: number, col: number): DataGridCellData {
        return this.cellData[this.rows[row]][this.cols[col]];
    }

    private detectChildChanges(): void {
        this.cellChangeDetector.detectChanges(this.rows, this.cols);
        this.editorDirtyEmitter.next();
    }

    private getClientRect(row: number, col: number): ClientRect {
        // use boundingClientRect to get floating point precision values
        const gridRect: ClientRect = this.gridRef.nativeElement.getBoundingClientRect();
        const cellRect: ClientRect = this.gridRef.nativeElement.children[row * this.colCount + col].getBoundingClientRect();
        return {
            top: cellRect.top - gridRect.top,
            bottom: cellRect.bottom - gridRect.top,
            left: cellRect.left - gridRect.left,
            right: cellRect.right - gridRect.left,
            width: cellRect.width,
            height: cellRect.height
        };
    }
}
