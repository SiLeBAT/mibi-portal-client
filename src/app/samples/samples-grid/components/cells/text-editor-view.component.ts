import { Component, Output, EventEmitter, OnInit, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { AnnotatedSampleDataEntry } from '../../../model/sample-management.model';

@Component({
    selector: 'mibi-samples-grid-text-editor-view',
    templateUrl: './text-editor-view.component.html',
    styleUrls: ['./text-editor-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridTextEditorViewComponent implements OnInit, AfterViewInit {
    @Input() data: AnnotatedSampleDataEntry;
    @Output() dataChange = new EventEmitter<string>();

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    ghostData: string;

    @ViewChild('focusElement', { static: true })
    private focusElement: ElementRef;

    ngOnInit(): void {
        this.ghostData = this.data.value + '\n';
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
        this.confirm.emit();
    }

    onEsc(e: KeyboardEvent): void {
        this.cancel.emit();
    }
}
