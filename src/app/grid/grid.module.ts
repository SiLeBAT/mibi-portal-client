import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DataGridViewComponent } from './data-grid/data-grid-view.component';
import { DataGridCellViewComponent } from './data-grid/internal/components/cell-view.component';
import { DataGridEditorViewComponent } from './data-grid/internal/components/editor-view.component';
import { DataGridDirtyEmitterDirective } from './data-grid/internal/components/dirty-emitter.directive';
import { SamplesGridViewComponent } from './samples-grid/samples-grid-view.component';
import { SamplesGridTextCellTemplateComponent } from './samples-grid/internal/cells/text-cell-template.component';
import { SamplesGridDataCellTemplateComponent } from './samples-grid/internal/cells/data-cell-template.component';
import { SamplesGridStackedCellTemplateComponent } from './samples-grid/internal/cells/stacked-cell-template.component';
import { SamplesGridToggleCellTemplateComponent } from './samples-grid/internal/cells/toggle-cell-template.component';
import { SamplesGridToolTipDirective } from './samples-grid/internal/cells/tool-tip.directive';
import { SamplesGridDataEditorTemplateComponent } from './samples-grid/internal/editors/data-editor-template.component';
import { SamplesGridListBoxViewComponent } from './samples-grid/internal/editors/list-box-view.component';
import { SamplesGridDataEditorViewComponent } from './samples-grid/internal/editors/data-editor-view.component';
import { SamplesGridAutoFocusDirective } from './samples-grid/internal/editors/auto-focus.directive';
import { SoftLineBreaksPipe } from './pipes/soft-line-breaks.pipe';

/**
 * The reusable data grid (generic `data-grid` + the `samples-grid` wrapper and
 * its cell/editor templates). It depends on neither SamplesModule nor
 * OrdersModule, so both feature modules can import it — which lets the results
 * view live in OrdersModule without a circular module dependency.
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule
    ],
    declarations: [
        DataGridDirtyEmitterDirective,
        DataGridCellViewComponent,
        DataGridEditorViewComponent,
        DataGridViewComponent,
        SamplesGridAutoFocusDirective,
        SamplesGridToolTipDirective,
        SamplesGridTextCellTemplateComponent,
        SamplesGridDataCellTemplateComponent,
        SamplesGridStackedCellTemplateComponent,
        SamplesGridToggleCellTemplateComponent,
        SamplesGridDataEditorTemplateComponent,
        SamplesGridListBoxViewComponent,
        SamplesGridDataEditorViewComponent,
        SamplesGridViewComponent,
        SoftLineBreaksPipe
    ],
    exports: [
        SamplesGridViewComponent
    ]
})
export class GridModule { }
