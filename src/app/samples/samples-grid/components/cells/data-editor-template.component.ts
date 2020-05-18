import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SamplesGridTemplateContainer } from '../template-container';
import { DataGridEditorContext } from '../../../data-grid/data-grid.model';

@Component({
    selector: 'mibi-samples-grid-data-editor-template',
    templateUrl: './data-editor-template.component.html',
    styleUrls: ['./data-editor-template.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class SamplesGridDataEditorTemplateComponent extends SamplesGridTemplateContainer<DataGridEditorContext> {

    get foo() {
        // console.log('editor');
        return '';
    }

    onEnter(e: KeyboardEvent): void {
        e.preventDefault();
    }
}
