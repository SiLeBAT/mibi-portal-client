import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import { ChangedDataGridField } from '../model/sample-management.model';
import { selectSampleData, selectImportedFileName } from '../state/samples.selectors';
import { SamplesMainSlice } from '../samples.state';
import { showActionBarSOA, updateActionBarTitleSOA } from '../../core/state/core.actions';
import { UserActionType } from '../../shared/model/user-action.model';
import { samplesUpdateSampleDataEntrySOA } from '../state/samples.actions';
import { samplesEditorModel } from './constants/model.constants';
import { SamplesEditorCacheBySampleCount } from './cache-by-sample-count.class';
import { DataGridColId } from '../data-grid/data-grid.model';
import { SamplesEditorColumnModel, SamplesEditorDataColumnModel } from './samples-editor.model';
import { SamplesGridDataChangeEvent, SamplesGridViewModel } from '../samples-grid/samples-grid.model';

@Component({
    template: `
        <mibi-samples-grid-view
            [model] = "samplesGridModel$ | async"
            (dataChange)="onDataChange($event)">
        </mibi-samples-grid-view>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesEditorComponent implements OnDestroy {

    readonly samplesGridModel$: Observable<SamplesGridViewModel> = this.store$.pipe(
        select(selectSampleData),
        map(samples => this.samplesGridModelCache.update(samples))
    );

    private readonly model = samplesEditorModel;
    private readonly columnModelMap: Record<DataGridColId, SamplesEditorColumnModel> = {};

    private readonly samplesGridModelCache = new SamplesEditorCacheBySampleCount(this.model);

    private fileNameSubscription: Subscription;

    constructor(private readonly store$: Store<SamplesMainSlice>) {

        this.model.columns.forEach(colModel => {
            this.columnModelMap[colModel.colId] = colModel;
        });

        setTimeout(() => {
            this.store$.dispatch(showActionBarSOA({
                title: '',
                enabledActions: [
                    UserActionType.SEND,
                    UserActionType.VALIDATE,
                    UserActionType.EXPORT,
                    UserActionType.CLOSE,
                    UserActionType.UPLOAD,
                    UserActionType.DOWNLOAD_TEMPLATE
                ]
            }));
        });

        this.fileNameSubscription = this.store$.pipe(
            select(selectImportedFileName),
            tap(fileName => {
                this.store$.dispatch(updateActionBarTitleSOA({ title: fileName }));
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.fileNameSubscription.unsubscribe();
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
