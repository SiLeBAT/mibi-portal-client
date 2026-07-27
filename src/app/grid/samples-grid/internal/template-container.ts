import { ViewChild, TemplateRef, Directive } from '@angular/core';
import { DataGridCellContext, DataGridEditorContext } from '../../data-grid/data-grid.model';

/* eslint-disable @angular-eslint/directive-class-suffix */
@Directive()
export abstract class SamplesGridTemplateContainer<T extends DataGridCellContext | DataGridEditorContext> {
    @ViewChild('template', { static: true })
        template: TemplateRef<T>;
}
