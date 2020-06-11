import { Component, ChangeDetectionStrategy, ViewChild, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { AnnotatedSampleDataEntry } from '../../../model/sample-management.model';

@Component({
    selector: 'mibi-samples-grid-data-editor-view',
    templateUrl: './data-editor-view.component.html',
    styleUrls: ['./data-editor-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridDataEditorViewComponent implements OnInit {

    @Input() data: AnnotatedSampleDataEntry;
    @Output() dataValueChange = new EventEmitter<string>();

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    // TEMPLATE PROPERTIES

    editorValue: string;

    get listValues(): string[] {
        return this.data.correctionOffer;
    }
    get isListActive(): boolean {
        return this.data.correctionOffer.length > 0;
    }

    listSelection: number = -1;
    listFilter: string;

    // PRIVATE PROPERTIES

    @ViewChild('editor', { static: true })
    private editorRef: ElementRef;

    private oldEditorValue: string;

    // LIFE CYCLE

    ngOnInit(): void {
        this.applyValue(this.data.value);
    }

    // EDITOR EVENT HANDLERS

    onEditorModelChange(value: string): void {
        this.applyValue(value);
        if (this.isListActive) {
            this.listSelection = -1;
        }
        this.dataValueChange.emit(value);
    }

    onEditorEnter(e: KeyboardEvent): void {
        e.preventDefault();
        this.refocusEditor();
        this.confirm.emit();
    }

    onEditorEsc(e: KeyboardEvent): void {
        if (this.listSelection === -1) {
            this.refocusEditor();
            this.cancel.emit();
        } else {
            this.listSelection = -1;
            this.applyListSelection();
        }
    }

    onEditorArrowDown(e: KeyboardEvent): void {
        e.preventDefault();

        this.listSelection++;
        if (this.listSelection >= this.listValues.length) {
            this.listSelection = 0;
        }
        this.applyListSelection();
    }

    onEditorArrowUp(e: KeyboardEvent): void {
        e.preventDefault();

        this.listSelection--;
        if (this.listSelection < 0) {
            this.listSelection = this.listValues.length - 1;
        }
        this.applyListSelection();
    }

    // LIST EVENT HANDLERS

    onListSelectionChange(index: number): void {
        this.listSelection = index;
        this.applyListSelection();
    }

    onListHoverChange(index: number): void {
        if (index !== -1) {
            this.listFilter = this.listValues[index];
        } else {
            this.listFilter = this.editorValue;
        }
    }

    onListConfirm(e: number): void {
        this.refocusEditor();
        this.confirm.emit();
    }

    onListFocusAcquire(): void {
        this.editorRef.nativeElement.focus({ preventScroll: true });
    }

    onListFocusRelease(): void {
        this.refocusEditor();
    }

    // PRIVATE METHODS

    private applyValue(value: string): void {
        if (this.isListActive) {
            this.oldEditorValue = value;
            this.listFilter = value;
        }
        this.editorValue = value;
    }

    private applyListSelection(): void {
        if (!this.isListActive) {
            return;
        }

        if (this.listSelection !== -1) {
            this.editorValue = this.listValues[this.listSelection];
        } else {
            this.editorValue = this.oldEditorValue;
        }
        this.listFilter = this.editorValue;
        this.dataValueChange.emit(this.editorValue);
    }

    private refocusEditor(): void {
        this.editorRef.nativeElement.blur();
        this.editorRef.nativeElement.focus();
    }
}
