import { Component, Output, EventEmitter, OnInit, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'mibi-data-grid-text-editor-view',
    templateUrl: './text-editor-view.component.html',
    styleUrls: ['./text-editor-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridTextEditorViewComponent implements OnInit, AfterViewInit {

    @Input() data: string;
    @Output() dataChange = new EventEmitter<string>();

    @ViewChild('focusElement', { static: true })
    private focusElement: ElementRef;

    ghostData: string;

    ngOnInit(): void {
        this.ghostData = this.data + '\n';
    }

    ngAfterViewInit(): void {
        this.focusElement.nativeElement.focus();
    }

    onModelChange(e: string): void {
        this.dataChange.emit(e);
        this.ghostData = e + '\n';
    }

    onEnter(e: KeyboardEvent): void {
        e.preventDefault();
    }
}
