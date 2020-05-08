import {
    Component,
    HostListener,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    TemplateRef,
    ChangeDetectorRef,
    AfterViewInit,
    OnChanges,
    SimpleChanges
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
    DataGridDataEvent,
    DataGridEditorData,
    DataGridMap
} from '../data-grid.model';
import { DataGridCellController, DataGridDirtyEmitter } from '../domain/cell-controller.model';
import { DataGridChangeDetector } from '../domain/change-detector.entity';
import { DataGridDirtyEmitterMap } from '../domain/dirty-emitter-map.entity';

enum MouseButton {
    PRIMARY = 0
}

enum MouseButtons {
    NONE = 0,
    PRIMARY = 1
}

@Component({
    selector: 'mibi-data-grid-view',
    templateUrl: './data-grid-view.component.html',
    styleUrls: ['./data-grid-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridViewComponent implements AfterViewInit, OnChanges {

    get foo() {
        // console.log('DataGrid');
        return '';
    }

    @Input() model: DataGridViewModel;
    @Input() cellTemplates: TemplateRef<DataGridCellContext>[][];
    @Input() editorTemplate: TemplateRef<DataGridCellContext>;

    @Output() dataEvent = new EventEmitter<DataGridDataEvent>();

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

    private get cellModels(): DataGridMap<DataGridCellViewModel> { return this.model.cellModels; }
    private get cellData(): DataGridMap<DataGridCellData> { return this.model.cellData; }

    private readonly dirtyEmitterMap = new DataGridDirtyEmitterMap();
    private readonly cellChangeDetector = new DataGridChangeDetector(this.dirtyEmitterMap);

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
            getRowId: (row) => this.rows[row],
            getColId: (col) => this.cols[col]
        };
    }

    ngAfterViewInit(): void {
        this.gridChangeDetector.detach();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log('', changes);
        const modelChange = changes.model;
        if (modelChange) {
            const oldModel = modelChange.previousValue as DataGridViewModel;
            const newModel = modelChange.currentValue as DataGridViewModel;

            if (modelChange.firstChange) {
                this.dirtyEmitterMap.init(newModel.rows, newModel.cols);
            } else {
                const rowsChanged = oldModel.rows !== newModel.rows;
                const colsChanged = oldModel.cols !== newModel.cols;
                const cellModelsChanged = oldModel.cellModels !== newModel.cellModels;
                const cellDataChanged = oldModel.cellData !== newModel.cellData;

                if (rowsChanged || colsChanged) {
                    this.dirtyEmitterMap.update(newModel.rows, newModel.cols, colsChanged);
                }

                if (cellModelsChanged) {
                    this.cellChangeDetector.markDirtyMap(oldModel.cellModels, newModel.cellModels, this.rows, this.cols);
                }

                if (cellDataChanged) {
                    this.cellChangeDetector.markDirtyMap(oldModel.cellData, newModel.cellData, this.rows, this.cols);
                }

                if (rowsChanged || colsChanged || cellModelsChanged) {
                    this.cursor.clear();
                    this.selection.clear();
                    this.hover.clear();
                    if (this.editor.isActive) {
                        this.cancelEditor();
                    }

                    this.gridChangeDetector.detectChanges();
                }

                this.detectCellChanges();
            }
        }
    }

    // CELL EVENT HANDLERS

    onCellMouseEvent(e: MouseEvent, row: number, col: number) {
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
        this.detectCellChanges();
    }

    // EDITOR EVENT HANDLERS

    onEditorDataChange(e: DataGridEditorData): void {
        this.editorData = e;
    }

    onEditorConfirm(): void {
        this.startSelection(this.selection, this.editor.row, this.editor.col);
        this.cursor.set(this.editor.row, this.editor.col);
        this.confirmEditor();
        this.detectCellChanges();
    }

    onEditorCancel(): void {
        this.startSelection(this.selection, this.editor.row, this.editor.col);
        this.cursor.set(this.editor.row, this.editor.col);
        this.cancelEditor();
        this.detectCellChanges();
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
        this.detectCellChanges();
    }

    @HostListener('window:mouseup', ['$event'])
    onWindowMouseUp(e: MouseEvent): void {
        this.isEdgeMouseDownLeft = false;
    }

    // TEMPLATE METHODS

    getDirtyEmitter(rowId: DataGridRowId, colId: DataGridColId): DataGridDirtyEmitter {
        return this.dirtyEmitterMap.getDirtyEmitter(rowId, colId);
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

    getElevation(row: number, col: number): number {
        const headerOffset = 10;
        const editorOffset = 5;
        let elevation = 0;

        if (this.isHeader(row, col)) {
            elevation += headerOffset;
        }
        if (this.isGridHeader(row, col)) {
            elevation += headerOffset;
        }
        if (this.editor.isOnCell(row, col)) {
            elevation += editorOffset;
        }

        return elevation;
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
        this.hover.clear();
    }

    // PRIVATE UI METHODS

    private startSelection(selection: DataGridSelectionManager, row: number, col: number): void {
        const isColHeader = this.isColHeader(row, col);
        const isRowHeader = this.isRowHeader(row, col);
        selection.startSelection(row, col, isColHeader, isRowHeader, this.rowCount, this.colCount);
    }

    private openEditor(row: number, col: number): void {
        this.editor.set(row, col);
        this.gridChangeDetector.detectChanges(); // recalc elevation
    }

    private confirmEditor(): void {
        if (this.editorData !== undefined) {
            this.dataEvent.emit({
                data: this.editorData,
                rowId: this.rows[this.editor.row],
                colId: this.cols[this.editor.col]
            });
        }
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

    private detectCellChanges(): void {
        this.cellChangeDetector.detectChanges(this.rows, this.cols);
    }
}
