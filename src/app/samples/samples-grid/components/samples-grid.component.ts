import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { DataGridCellContext, DataGridColId, DataGridViewModel, DataGridDataEvent } from '../../data-grid/data-grid.model';
import { Sample, ChangedDataGridField } from '../../model/sample-management.model';
import { samplesGridModel } from '../constants/model.constants';
import { SamplesGridColumnModel, SamplesGridDataColumnModel } from '../samples-grid.model';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectFormData, selectImportedFileName } from '../../state/samples.selectors';
import { SamplesMainSlice } from '../../samples.state';
import { ShowActionBarSOA, UpdateActionBarTitleSOA } from '../../../core/state/core.actions';
import { UserActionType } from '../../../shared/model/user-action.model';
import { map, tap } from 'rxjs/operators';
import { SamplesGridViewModelCacheBySampleCount } from '../view-model-cache.entity';
import { UpdateSampleDataEntrySOA } from '../../state/samples.actions';
import { SamplesGridTemplatesComponent } from './samples-grid.templates';

@Component({
    templateUrl: './samples-grid.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridComponent implements OnDestroy {

    get foo() {
        // console.log('samples');
        return '';
    }

    readonly colMap: Record<DataGridColId, SamplesGridColumnModel> = {};

    readonly dataGridModel$: Observable<DataGridViewModel> = this.store$.pipe(
        select(selectFormData),
        tap(samples => {
            this.samples = samples;
        }),
        map(samples => this.viewModelCache.getViewModel(samples))
    );

    get cellTemplates(): TemplateRef<DataGridCellContext>[][] {
        const row = new Array<TemplateRef<DataGridCellContext>>(this.model.columns.length)
            .fill(this.templates.cellTemplate);
        return new Array<TemplateRef<DataGridCellContext>[]>(this.samples.length + 1).fill(row);
    }

    @ViewChild('templates', { static: true })
    private templates: SamplesGridTemplatesComponent;

    private samples: Sample[];

    private readonly model = samplesGridModel;
    private readonly viewModelCache = new SamplesGridViewModelCacheBySampleCount(this.model);

    private fileNameSubscription: Subscription;

    constructor(private readonly store$: Store<SamplesMainSlice>) {
        this.model.columns.forEach(col => {
            this.colMap[col.colId] = col;
        });

        this.store$.dispatch(new ShowActionBarSOA({
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

        this.fileNameSubscription = this.store$.pipe(
            select(selectImportedFileName),
            tap(fileName => this.store$.dispatch(new UpdateActionBarTitleSOA({ title: fileName })))
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.fileNameSubscription.unsubscribe();
    }

    onDataEvent(e: DataGridDataEvent): void {
        const dataModel = this.colMap[e.colId] as SamplesGridDataColumnModel;

        const payload: ChangedDataGridField = {
            rowIndex: this.model.getSampleIndex(e.rowId),
            columnId: dataModel.selector,
            newValue: e.data
        };

        this.store$.dispatch(new UpdateSampleDataEntrySOA(payload));
    }
}
