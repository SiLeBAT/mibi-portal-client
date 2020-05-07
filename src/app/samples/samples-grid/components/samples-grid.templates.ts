import { Component, ChangeDetectionStrategy, TemplateRef, ViewChild, Input } from '@angular/core';
import { DataGridCellContext, DataGridColId } from '../../data-grid/data-grid.model';
import { SamplesGridColumnType, SamplesGridColumnModel } from '../samples-grid.model';

@Component({
    selector: 'mibi-samples-grid-templates',
    templateUrl: './samples-grid.templates.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridTemplatesComponent {

    get foo() {
        // console.log('template');
        return '';
    }

    @ViewChild('cellTemplate', { static: true })
    cellTemplate: TemplateRef<DataGridCellContext>;

    @Input() colMap: Record<number, SamplesGridColumnModel>;

    get idType(): SamplesGridColumnType {
        return SamplesGridColumnType.ID;
    }

    get nrlType(): SamplesGridColumnType {
        return SamplesGridColumnType.NRL;
    }

    get dataType(): SamplesGridColumnType {
        return SamplesGridColumnType.DATA;
    }

    getCellType(colId: DataGridColId): SamplesGridColumnType {
        return this.colMap[colId].type;
    }
}
