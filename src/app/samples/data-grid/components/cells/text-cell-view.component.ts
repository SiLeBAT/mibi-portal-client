import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DataGridCellViewModel } from '../../view-model.model';

@Component({
    selector: 'mibi-data-grid-text-cell-view',
    templateUrl: './text-cell-view.component.html',
    styleUrls: ['./text-cell-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridTextCellViewComponent {
    @Input() cellData: DataGridCellViewModel;
}
