import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DataGridCellContext } from '../../../data-grid/data-grid.model';
import { SamplesGridTemplateContainer } from '../template-container';

@Component({
    selector: 'mibi-samples-grid-text-cell-template',
    templateUrl: './text-cell-template.component.html',
    styleUrls: ['./text-cell-template.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridTextCellTemplateComponent extends SamplesGridTemplateContainer<DataGridCellContext> {
}
