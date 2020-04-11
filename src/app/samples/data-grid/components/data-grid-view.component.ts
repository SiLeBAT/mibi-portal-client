import { Component, HostListener, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DataGridCellTool } from '../domain/cell-tool.entity';
import { DataGridSelectionManager } from '../domain/selection-manager.entity';
import { DataGridClearingManager } from '../domain/clearing-manager.entity';
import { DataGridViewModel, DataGridRowViewModel, DataGridCellDataEvent, DataGridCellViewModel } from '../view-model.model';

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

    @Input() gridData: DataGridViewModel;
    @Output() cellDataChange = new EventEmitter<DataGridCellDataEvent>();

    // TEMPLATE PROPERTIES

    get rows(): DataGridRowViewModel[] {
        return this.gridData.rows;
    }

    get rowCount(): number {
        return this.gridData.rowCount;
    }
    get colCount(): number {
        return this.gridData.colCount;
    }

    editorData: string;

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

        if (this.editor.isActive()) {
            this.emitAndClearEditorData();
        }
        this.editor.clear();

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
            this.cursor.clear();
            this.selection.clear();
            this.editor.set(row, col);
            this.editorData = this.rows[row].cols[col].value;
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

    onEditorEnter(e: KeyboardEvent, row: number, col: number) {
        this.emitAndClearEditorData();
        this.editor.clear();
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
            if (this.editor.isActive()) {
                this.emitAndClearEditorData();
            }
            this.editor.clear();
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

    getRowId(index: number, row: DataGridRowViewModel): number {
        return row.uId;
    }

    getColId(index: number, col: DataGridCellViewModel): number {
        return col.uId;
    }

    isHeader(row: number, col: number): boolean {
        return this.isRowHeader(row, col) || this.isColHeader(row, col);
    }

    isColHeader(row: number, col: number): boolean {
        return this.rows[row].cols[col].isColHeader;
    }

    isRowHeader(row: number, col: number): boolean {
        return this.rows[row].cols[col].isRowHeader;
    }

    isGridHeader(row: number, col: number): boolean {
        return this.isRowHeader(row, col) && this.isColHeader(row, col);
    }

    isReadOnly(row: number, col: number): boolean {
        return this.rows[row].cols[col].isReadOnly;
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

    private emitAndClearEditorData(): void {
        const rowData = this.gridData.rows[this.editor.row];
        const colData = rowData.cols[this.editor.col];

        this.cellDataChange.emit({
            row: this.editor.row,
            col: this.editor.col,
            rowId: rowData.uId,
            colId: colData.uId,
            value: this.editorData,
            oldValue: colData.value
        });

        this.editorData = '';
    }
}
