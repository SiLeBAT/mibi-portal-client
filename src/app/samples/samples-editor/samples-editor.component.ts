import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import { ChangedDataGridField, Sample } from '../model/sample-management.model';
import { selectSampleData, selectImportedFileName } from '../state/samples.selectors';
import { SamplesMainSlice } from '../samples.state';
import { showActionBarSOA, updateActionBarTitleSOA } from '../../core/state/core.actions';
import { UserActionType } from '../../shared/model/user-action.model';
import { samplesUpdateSampleDataEntrySOA } from '../state/samples.actions';
import { samplesEditorModel, samplesEditorModel18 } from './constants/model.constants';
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
        map(samples => this.getSamplesGridViewModel(samples))
    );

    private readonly model = samplesEditorModel;
    private readonly modelV18 = samplesEditorModel18;
    private readonly columnModelMap: Record<DataGridColId, SamplesEditorColumnModel> = {};
    private readonly columnModelMapV18: Record<DataGridColId, SamplesEditorColumnModel> = {};

    private readonly samplesGridModelCache = new SamplesEditorCacheBySampleCount(this.model);
    private readonly samplesGridModelCacheV18 = new SamplesEditorCacheBySampleCount(this.modelV18);

    private fileNameSubscription: Subscription;

    private currentVersion = '18';

    constructor(private readonly store$: Store<SamplesMainSlice>) {

        this.model.columns.forEach(colModel => {
            this.columnModelMap[colModel.colId] = colModel;
        });

        this.modelV18.columns.forEach(colModel => {
            this.columnModelMapV18[colModel.colId] = colModel;
        });

        this.store$.dispatch(showActionBarSOA({
            title: '',
            enabledActions: [
                UserActionType.SEND,
                UserActionType.VALIDATE,
                UserActionType.EXPORT,
                UserActionType.CLOSE,
                UserActionType.UPLOAD,
                UserActionType.DOWNLOAD_TEMPLATE,
                UserActionType.DOWNLOAD_ZOMO_PLAN_FILE
            ]
        }));

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
        let dataModel: SamplesEditorDataColumnModel;
        switch (this.currentVersion) {
            case '17': {
                dataModel = this.columnModelMap[e.colId] as SamplesEditorDataColumnModel;
                break;
            }
            case '18':
            default: {
                dataModel = this.columnModelMapV18[e.colId] as SamplesEditorDataColumnModel;
                break;
            }
        }

        const changedField: ChangedDataGridField = {
            rowIndex: this.model.getSampleIndex(e.rowId),
            columnId: dataModel.selector,
            newValue: e.data
        };

        this.store$.dispatch(samplesUpdateSampleDataEntrySOA({ changedField: changedField }));
    }

    private getSamplesGridViewModel(samples: Sample[]) {
        if (samples.length > 0
            && samples[0].sampleData.sequence_id !== undefined
            && samples[0].sampleData.sequence_status !== undefined) {
            this.currentVersion = '18';
            return this.samplesGridModelCacheV18.update(samples);
        }
        this.currentVersion = '17';

        return this.samplesGridModelCache.update(samples);
    }
}
