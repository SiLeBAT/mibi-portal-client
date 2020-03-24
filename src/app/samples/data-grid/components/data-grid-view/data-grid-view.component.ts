import { Component, OnInit, HostListener } from '@angular/core';
import { DataGridUICell, DataGridEditor, DataGridSelection } from './data-grid-view.model';

@Component({
    selector: 'mibi-data-grid-view',
    templateUrl: './data-grid-view.component.html',
    styleUrls: ['./data-grid-view.component.scss']
})
export class DataGridViewComponent implements OnInit {

    private readonly MOUSE_BUTTON_PRIMARY = 0;
    private readonly MOUSE_BUTTONS_PRIMARY = 1;

    private readonly HEADER_ROW = 0;
    private readonly HEADER_COL = 0;

    private readonly cursor = new DataGridUICell();
    private readonly editor = new DataGridEditor();
    private readonly selection = new DataGridSelection();

    private doClearUIOnWindowClick = true;

    get editorData(): string {
        return this.editor.data;
    }
    set editorData(value: string) {
        this.editor.data = value;
    }

    testData: string[][];
    n = 10;

    clipboard: string;

    // COMPONENT

    constructor() {
        this.testData = [];
        for (let i = 0; i < 100; i++) {
            this.testData.push([]);
            for (let j = 0; j < 10; j++) {
                this.testData[i].push('testData ' + i.toString() + ' ' + j.toString());
            }
        }
    }

    ngOnInit(): void {

    }

    // OVERLAY EVENT HANDLERS

    handleOverlayMouseOver(e: MouseEvent, row: number, col: number): void {
        if (e.buttons !== this.MOUSE_BUTTONS_PRIMARY) {
            return;
        }

        this.log('mouseover overlay');

        if (this.selection.doSelection()) {
            this.cursor.clear();
            this.selection.select(row, col, this.testData.length, this.testData[0].length);
        }
    }

    handleOverlayMouseDown(e: MouseEvent, row: number, col: number): void {
        if (e.button !== this.MOUSE_BUTTON_PRIMARY) {
            return;
        }

        this.log('mousedown overlay ' + row + ' ' + col);

        // clear any selected elements not part of the grid to prevent drag and drop behaviour
        const sel = window.getSelection();
        if (sel) {
            sel.empty();
        }

        // editor -> editor
        if (this.hasEditor(row, col)) {
            return;
        }

        if (this.editor.isActive()) {
            this.testData[this.editor.row][this.editor.col] = this.editorData;
        }
        this.editor.clear();

        if (!this.hasCursor(row, col)) {
            this.cursor.clear();
        }

        // -> selection start
        this.selection.start(row, col, this.testData.length, this.testData[0].length);
    }

    handleOverlayClick(e: MouseEvent, row: number, col: number): void {
        if (e.button !== this.MOUSE_BUTTON_PRIMARY) {
            return;
        }

        this.log('click overlay ' + row + ' ' + col);

        if (this.isHeader(row, col)) {
            return;
        }

        // editor -> editor
        if (this.hasEditor(row, col)) {
            return;
        }

        // cursor -> editor
        if (this.hasCursor(row, col)) {
            this.cursor.clear();
            this.selection.clear();
            this.editor.start(this.testData[row][col], row, col);
            return;
        }

        // void -> cursor {
        this.cursor.set(row, col);
    }

    // GRID EVENT HANDLERS

    handleGridMouseDown(e: MouseEvent) {
        if (e.button !== this.MOUSE_BUTTON_PRIMARY) {
            return;
        }

        this.log('mousedown grid');

        // grid was clicked so it handles any UI clearing itself
        this.doClearUIOnWindowClick = false;
    }

    // WINDOW EVENT HANDLERS

    @HostListener('window:focus', ['$event'])
    handleWindowFocus(e: FocusEvent): void {
        this.log('focus window');
    }

    @HostListener('window:blur', ['$event'])
    handleWindowBlur(e: FocusEvent): void {
        this.log('blur window');
    }

    @HostListener('window:mousedown', ['$event'])
    handleWindowMouseDown(e: MouseEvent): void {
        if (e.button !== this.MOUSE_BUTTON_PRIMARY) {
            return;
        }

        this.log('mousedown window');

        if (this.doClearUIOnWindowClick) {
            if (this.editor.isActive()) {
                this.testData[this.editor.row][this.editor.col] = this.editorData;
            }
            this.editor.clear();
            this.cursor.clear();
            this.selection.clear();
        } else {
            // so perhaps clear next time
            this.doClearUIOnWindowClick = true;
        }
    }

    // OLD

    doCopy(ev: ClipboardEvent, row: number, col: number): void {
        // this.log('copy' + row + ' ' + col);
        // this.log(this.editableRow + ' ' + this.editableCol);
        // if (this.editableRow !== -1) {
        //     return;
        // }
        // ev.preventDefault();
        // this.clipboard = "";
        // let lastRow = -1;
        // for (var i = 0; i < this.selected.length; i++) {
        //     if (i != 0) {
        //         if (lastRow !== this.selected[i].row) {
        //             this.clipboard += '\n';
        //         }
        //         else {
        //             this.clipboard += '\t';
        //         }
        //     }
        //     lastRow = this.selected[i].row;
        //     this.clipboard += '"' + this.testData[this.selected[i].row][this.selected[i].col] + '"';
        // }

        // if (ev.clipboardData) {
        //     ev.clipboardData.setData("text", this.clipboard);
        // }
    }

    @HostListener('paste', ['$event'])
    handle(e: ClipboardEvent): void {
        if (e.clipboardData) {
            e.clipboardData.setData('text', 'test');
            this.log(e.clipboardData.getData('text'));
        }
    }

    // TEMPLATE METHODS

    isRowHeader(row: number): boolean {
        return row === this.HEADER_ROW;
    }

    isColHeader(col: number): boolean {
        return col === this.HEADER_COL;
    }

    isHeader(row: number, col: number): boolean {
        return this.isRowHeader(row) || this.isColHeader(col);
    }

    hasSelectionAnchor(row: number, col: number) {
        return this.selection.isAnchorCell(row, col);
    }

    isSelected(row: number, col: number) {
        return this.selection.isSelected(row, col);
    }

    hasCursor(row: number, col: number): boolean {
        return this.cursor.isActiveCell(row, col);
    }

    hasEditor(row: number, col: number): boolean {
        return this.editor.isActiveCell(row, col);
    }

    calcEditorWidth(gridRect: ClientRect, cellRect: ClientRect): number {
        return this.calcSize(cellRect.left, gridRect.left, gridRect.width);
    }

    calcEditorHeight(gridRect: ClientRect, cellRect: ClientRect): number {
        return this.calcSize(cellRect.top, gridRect.top, gridRect.height);
    }

    private calcSize(cellPos: number, gridPos: number, gridSize: number) {
        return gridSize - (cellPos - gridPos);
    }

    // DEBUG

    logText(text: string): void {
        this.log(text);
    }

    private log(text: string) {
        // console.log(text);
    }
}
