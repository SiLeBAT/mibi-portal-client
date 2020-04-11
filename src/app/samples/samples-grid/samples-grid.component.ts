import { Component, OnInit } from '@angular/core';
import { DataGridViewModel, DataGridCellDataEvent } from '../data-grid/view-model.model';
import * as _ from 'lodash';
import { Store, select } from '@ngrx/store';
import { SamplesMainSlice } from '../samples.state';
import { selectSampleGridViewModel } from './samples-grid.selectors';
import { Observable } from 'rxjs';
import { ChangedDataGridField } from '../model/sample-management.model';
import { UpdateSampleDataEntrySOA } from '../state/samples.actions';
import { UpdateActionItemsSOA } from '../../core/state/core.actions';
import { UserActionType } from '../../shared/model/user-action.model';
import { samplesGridColumnDefinitions } from './column-definitions.constants';

@Component({
    selector: 'mibi-samples-grid',
    template: `
    <mibi-data-grid-view
        [gridData]="gridData | async"
        (cellDataChange)="onGridCellDataChange($event)"
    >
    </mibi-data-grid-view>`
})
export class SamplesGridComponent implements OnInit {

    gridData: Observable<DataGridViewModel> = this.$store.pipe(select(selectSampleGridViewModel));

    constructor(private $store: Store<SamplesMainSlice>) { }

    ngOnInit(): void {
        this.$store.dispatch(new UpdateActionItemsSOA(
            [
                UserActionType.SEND,
                UserActionType.VALIDATE,
                UserActionType.EXPORT,
                UserActionType.CLOSE,
                UserActionType.UPLOAD,
                UserActionType.DOWNLOAD_TEMPLATE
            ]));
    }

    onGridCellDataChange(e: DataGridCellDataEvent): void {
        const colDef = samplesGridColumnDefinitions[e.col];
        if (colDef.getSampleDataSelector) {
            const payload: ChangedDataGridField = {
                rowIndex: e.rowId - 2,
                columnId: colDef.getSampleDataSelector(),
                originalValue: e.oldValue,
                newValue: e.value
            };
            this.$store.dispatch(new UpdateSampleDataEntrySOA(payload));
        }
    }
}
