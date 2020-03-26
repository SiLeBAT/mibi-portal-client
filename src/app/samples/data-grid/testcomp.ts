import { Component, Output, EventEmitter, ViewChild, ElementRef, OnInit, Input, AfterViewInit } from '@angular/core';

@Component({
    selector: 'mibi-test-comp',
    templateUrl: './testcomp.html',
    styleUrls: ['./testcomp.scss']
})
export class TestComponent implements OnInit, AfterViewInit {
    get scrollWidth(): number {
        return this.editor.nativeElement.scrollWidth;
    }

    @Input() maxWidth: number;
    @Input() maxHeight: number;
    // foo

    @Input() data: string;
    @Output() dataChange = new EventEmitter<string>();

    @Output() onBlur = new EventEmitter<FocusEvent>();
    @Output() onFocus = new EventEmitter<FocusEvent>();

    @ViewChild('editor', { static: true })
    private editor: ElementRef;

    rows: number;
    cols: number;

    immediateData: string;

    private foo: string;

    ngOnInit(): void {
        this.immediateData = this.data + ' ';
        this.setRowsAndCols(this.data);
    }

    ngAfterViewInit(): void {
        this.editor.nativeElement.focus();
    }

    handleBlur(e: FocusEvent): void {
        this.onBlur.emit(e);
    }

    handleFocus(e: FocusEvent): void {
        this.onFocus.emit(e);
    }

    handleDataChange(e: string): void {
        this.dataChange.emit(e);
        this.immediateData = e + ' ';
        this.setRowsAndCols(e);
    }

    logText(text: string): void {
        this.log(text);
    }

    private setRowsAndCols(data: string): void {
        this.rows = 2;
        this.cols = data.length;
    }
    private log(text: string): void {
        // console.log(text);
        this.foo = text;
    }
}
