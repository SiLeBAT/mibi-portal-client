import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DataGridCellContext } from '../../../data-grid/data-grid.model';
import { SamplesGridTemplateContainer } from '../template-container';

@Component({
    standalone: false,
    selector: 'mibi-samples-grid-toggle-cell-template',
    templateUrl: './toggle-cell-template.component.html',
    styleUrls: ['./toggle-cell-template.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridToggleCellTemplateComponent extends SamplesGridTemplateContainer<DataGridCellContext> {
}
