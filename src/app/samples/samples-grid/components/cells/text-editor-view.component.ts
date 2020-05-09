import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SamplesGridTemplateContainer } from './template-container';
import { DataGridEditorContext } from '../../../data-grid/data-grid.model';

@Component({
    selector: 'mibi-samples-grid-text-editor-view',
    templateUrl: './text-editor-view.component.html',
    styleUrls: ['./text-editor-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridTextEditorViewComponent extends SamplesGridTemplateContainer<DataGridEditorContext> {

    get foo() {
        // console.log('editor');
        return '';
    }

    onEnter(e: KeyboardEvent): void {
        e.preventDefault();
    }
}
