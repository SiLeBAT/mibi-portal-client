import { Component, HostListener, Input, Output, EventEmitter, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { DataGridCellTool } from '../domain/cell-tool.entity';
import { DataGridSelectionManager } from '../domain/selection-manager.entity';
import { DataGridClearingManager } from '../domain/clearing-manager.entity';
import {
    DataGridViewModel,
    DataGridRowViewModel,
    DataGridEditorEvent,
    DataGridCellViewModel,
    DataGridCellContext,
    DataGridUIdViewModel
} from '../view-model.model';

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
export class DataGridViewComponent {
    @Input() model: DataGridViewModel;
    @Input() cellTemplate: TemplateRef<DataGridCellContext>;
    @Input() editorTemplate: TemplateRef<DataGridCellContext>;

    @Output() editorOpen = new EventEmitter<DataGridEditorEvent>();
    @Output() editorConfirm = new EventEmitter<DataGridEditorEvent>();

    // TEMPLATE PROPERTIES

    get rows(): DataGridRowViewModel[] {
        return this.model.rows;
    }

    get rowCount(): number {
        return this.model.rowCount;
    }
    get colCount(): number {
        return this.model.colCount;
    }

    // PRIVATE PROPERTIES

    private readonly cursor = new DataGridCellTool();
    private readonly editor = new DataGridCellTool();

    private readonly selection = new DataGridSelectionManager();
    private readonly hover = new DataGridSelectionManager();
    private readonly clearing = new DataGridClearingManager();

    // edge workaround for detecting mouseover event with button pressed
    private isEdgeMouseDownLeft = false;

    // MOUSE UI EVENT HANDLERS

    onCellMouseOver(e: MouseEvent, row: number, col: number): void {
        if (e.buttons === MouseButtons.NONE && !this.isEdgeMouseDownLeft) {
            this.startSelection(this.hover, row, col);
        }

        if (e.buttons !== MouseButtons.PRIMARY && !this.isEdgeMouseDownLeft) {
            return;
        }

        if (this.selection.isSelecting()) {
            this.cursor.clear();
            this.selection.select(row, col);
        }
    }

    onCellMouseDown(e: MouseEvent, row: number, col: number): void {
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

        this.closeEditor();

        if (!this.cursor.isOnCell(row, col)) {
            this.cursor.clear();
        }

        this.startSelection(this.selection, row, col);
    }

    onCellClick(e: MouseEvent, row: number, col: number): void {
        if (e.button !== MouseButton.PRIMARY) {
            return;
        }

        if (this.isReadOnly(row, col)) {
            return;
        }

        if (this.editor.isOnCell(row, col)) {
            return;
        }

        if (this.cursor.isOnCell(row, col)) {
            this.openEditor(row, col);
            return;
        }

        this.cursor.set(row, col);
    }

    onCellMouseUp(e: MouseEvent, row: number, col: number): void {
        this.startSelection(this.hover, row, col);
    }

    onCellMouseOut(e: MouseEvent, row: number, col: number): void {
        this.hover.clear();
    }

    // KEYBOARD UI EVENT HANDLERS

    onCellEnter(e: KeyboardEvent, row: number, col: number) {
        if (!this.editor.isOnCell(row, col)) {
            return;
        }
        this.closeEditor();
        this.startSelection(this.selection, row, col);
        this.cursor.set(row, col);
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

        if (this.clearing.doClearUI()) {
            this.closeEditor();
            this.cursor.clear();
            this.selection.clear();
        }
        this.clearing.clear();
    }

    // WINDOW EVENT HANDLERS

    @HostListener('window:mouseup', ['$event'])
    onWindowMouseUp(e: MouseEvent): void {
        this.isEdgeMouseDownLeft = false;
    }

    // TEMPLATE METHODS

    getId(index: number, uIdModel: DataGridUIdViewModel): number {
        return uIdModel.uId;
    }

    getCellContext(rowModel: DataGridRowViewModel, cellModel: DataGridCellViewModel): DataGridCellContext {
        return {
            rowModel: rowModel,
            cellModel: cellModel
        };
    }

    isHeader(row: number, col: number): boolean {
        return this.isRowHeader(row, col) || this.isColHeader(row, col);
    }

    isColHeader(row: number, col: number): boolean {
        return this.rows[row].cells[col].isColHeader;
    }

    isRowHeader(row: number, col: number): boolean {
        return this.rows[row].cells[col].isRowHeader;
    }

    isGridHeader(row: number, col: number): boolean {
        return this.isRowHeader(row, col) && this.isColHeader(row, col);
    }

    isReadOnly(row: number, col: number): boolean {
        return this.rows[row].cells[col].isReadOnly;
    }

    hasHoverAnchor(row: number, col: number) {
        return this.hover.anchor.isOnCell(row, col);
    }

    hasSelectionAnchor(row: number, col: number): boolean {
        return this.selection.anchor.isOnCell(row, col);
    }

    hasSelectionSelector(row: number, col: number): boolean {
        return this.selection.selector.isOnCell(row, col);
    }

    hasCursor(row: number, col: number): boolean {
        return this.cursor.isOnCell(row, col);
    }

    hasEditor(row: number, col: number): boolean {
        return this.editor.isOnCell(row, col);
    }

    isHovered(row: number, col: number): boolean {
        if (!this.hover.isSelecting()) {
            return false;
        }

        const anchor = this.hover.anchor;
        const anchorOnHeaderEditor = this.isHeader(anchor.row, anchor.col) && this.hasEditor(anchor.row, anchor.col);

        // disbale hovering if editor is on a header
        if (anchorOnHeaderEditor && !this.hasHoverAnchor(row, col)) {
            return false;
        }

        return this.hover.isSelected(row, col);
    }

    isHoverHinted(row: number, col: number): boolean {
        if (!this.hover.isSelecting()) {
            return false;
        }

        if (!this.isHeader(row, col)) {
            return false;
        }

        if (this.hasHoverAnchor(row, col)) {
            return false;
        }

        const anchor = this.hover.anchor;

        if (this.isGridHeader(row, col)) {
            return anchor.isInCol(col) || anchor.isInRow(row);
        } else if (this.isColHeader(row, col)) {
            return anchor.isInCol(col);
        } else {
            return anchor.isInRow(row);
        }
    }

    isSelected(row: number, col: number): boolean {
        return this.selection.isSelected(row, col);
    }

    isSelectionHinted(row: number, col: number): boolean {
        if (!this.selection.isSelecting()) {
            return false;
        }

        if (!this.isHeader(row, col)) {
            return false;
        }

        if (this.isSelected(row, col) || this.hasEditor(row, col)) {
            return false;
        }

        const hasSelectionInRow = this.selection.hasSelectionInRow(row) || this.editor.isInRow(row);
        const hasSelectionInCol = this.selection.hasSelectionInCol(col) || this.editor.isInCol(col);

        if (this.isGridHeader(row, col)) {
            return hasSelectionInRow || hasSelectionInCol;
        } else if (this.isColHeader(row, col)) {
            return hasSelectionInCol;
        } else {
            return hasSelectionInRow;
        }
    }

    calcCellElevation(row: number, col: number): number {
        const headerOffset = 10;
        const editorOffset = 5;

        let elevation = 1;
        if (this.isHeader(row, col)) {
            elevation += headerOffset;
        }
        if (this.isGridHeader(row, col)) {
            elevation += headerOffset;
        }
        if (this.hasEditor(row, col)) {
            elevation += editorOffset;
        }

        return elevation;
    }

    // PRIVATE METHODS

    private startSelection(selection: DataGridSelectionManager, row: number, col: number): void {
        selection.startSelection(row, col, this.isColHeader(row, col), this.isRowHeader(row, col), this.rowCount, this.colCount);
    }

    private openEditor(row: number, col: number): void {
        this.cursor.clear();
        this.selection.clear();
        this.editor.set(row, col);
        this.editorOpen.emit(this.createEditorEvent());
    }

    private closeEditor(): void {
        if (!this.editor.isActive()) {
            return;
        }
        this.editorConfirm.emit(this.createEditorEvent());
        this.editor.clear();
    }

    private createEditorEvent(): DataGridEditorEvent {
        const rowModel = this.model.rows[this.editor.row];
        const cellModel = rowModel.cells[this.editor.col];

        return {
            rowId: rowModel.uId,
            cellId: cellModel.uId
        };
    }
}
