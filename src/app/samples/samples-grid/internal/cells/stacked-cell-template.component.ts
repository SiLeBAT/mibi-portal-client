import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DataGridCellContext } from '../../../data-grid/data-grid.model';
import { SamplesGridTemplateContainer } from '../template-container';

@Component({
    standalone: false,
    selector: 'mibi-samples-grid-stacked-cell-template',
    templateUrl: './stacked-cell-template.component.html',
    styleUrls: ['./stacked-cell-template.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridStackedCellTemplateComponent extends SamplesGridTemplateContainer<DataGridCellContext> {
}
