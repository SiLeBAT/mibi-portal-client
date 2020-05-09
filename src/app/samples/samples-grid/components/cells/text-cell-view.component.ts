import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DataGridCellContext } from '../../../data-grid/data-grid.model';
import { SamplesGridTemplateContainer } from './template-container';

@Component({
    selector: 'mibi-samples-grid-text-cell-view',
    templateUrl: './text-cell-view.component.html',
    styleUrls: ['./text-cell-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridTextCellViewComponent extends SamplesGridTemplateContainer<DataGridCellContext> {
}
