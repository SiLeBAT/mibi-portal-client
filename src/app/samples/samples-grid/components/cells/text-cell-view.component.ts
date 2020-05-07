import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DataGridCellViewModel } from '../../../data-grid/data-grid.model';

@Component({
    selector: 'mibi-samples-grid-text-cell-view',
    templateUrl: './text-cell-view.component.html',
    styleUrls: ['./text-cell-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridTextCellViewComponent {
    @Input() model: DataGridCellViewModel;
    @Input() data: string;
}
