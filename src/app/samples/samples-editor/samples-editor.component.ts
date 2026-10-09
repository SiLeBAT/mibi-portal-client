import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { ChangedDataGridField } from '../model/sample-management.model';
import { selectSampleData } from '../state/samples.selectors';
import { SamplesMainSlice } from '../samples.state';
import { samplesUpdateSampleDataEntrySOA } from '../state/samples.actions';
import { samplesEditorModel } from './constants/model.constants';
import { SamplesEditorCacheBySampleCount } from './cache-by-sample-count.class';
import { DataGridColId } from '../../grid/data-grid/data-grid.model';
import { SamplesEditorColumnModel, SamplesEditorDataColumnModel } from './samples-editor.model';
import { SamplesGridDataChangeEvent, SamplesGridViewModel } from '../../grid/samples-grid/samples-grid.model';

@Component({
    standalone: false,
    template: `
        <mibi-samples-grid-view
            [model] = "samplesGridModel$ | async"
            (dataChange)="onDataChange($event)">
        </mibi-samples-grid-view>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesEditorComponent {

    readonly samplesGridModel$: Observable<SamplesGridViewModel> = this.store$.pipe(
        select(selectSampleData),
        map(samples => this.samplesGridModelCache.update(samples))
    );

    private readonly model = samplesEditorModel;
    private readonly columnModelMap: Record<DataGridColId, SamplesEditorColumnModel> = {};

    private readonly samplesGridModelCache = new SamplesEditorCacheBySampleCount(this.model);

    // The action bar's title follows the imported file name, which
    // SamplesActionBarEffects already watches, so this component no longer
    // reports it.
    constructor(private readonly store$: Store<SamplesMainSlice>) {
        this.model.columns.forEach(colModel => {
            this.columnModelMap[colModel.colId] = colModel;
        });
    }

    onDataChange(e: SamplesGridDataChangeEvent): void {
        const dataModel = this.columnModelMap[e.colId] as SamplesEditorDataColumnModel;

        const changedField: ChangedDataGridField = {
            rowIndex: this.model.getSampleIndex(e.rowId),
            columnId: dataModel.selector,
            newValue: e.data
        };

        this.store$.dispatch(samplesUpdateSampleDataEntrySOA({ changedField: changedField }));
    }
}
