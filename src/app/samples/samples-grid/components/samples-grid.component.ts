import { Component, ChangeDetectionStrategy, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { DataGridCellContext, DataGridColId, DataGridViewModel, DataGridDataEvent, DataGridTemplateMap, DataGridEditorContext } from '../../data-grid/data-grid.model';
import { ChangedDataGridField } from '../../model/sample-management.model';
import { samplesGridModel } from '../constants/model.constants';
import { SamplesGridColumnModel, SamplesGridDataColumnModel, SamplesGridCellType, SamplesGridEditorType } from '../samples-grid.model';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectFormData, selectImportedFileName } from '../../state/samples.selectors';
import { SamplesMainSlice } from '../../samples.state';
import { ShowActionBarSOA, UpdateActionBarTitleSOA } from '../../../core/state/core.actions';
import { UserActionType } from '../../../shared/model/user-action.model';
import { map, tap } from 'rxjs/operators';
import { SamplesGridViewModelCacheBySampleCount } from '../view-model-cache.entity';
import { UpdateSampleDataEntrySOA } from '../../state/samples.actions';
import { SamplesGridTemplateContainer } from './template-container';

@Component({
    templateUrl: './samples-grid.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridComponent implements OnDestroy, OnInit {

    get foo() {
        // console.log('samples');
        return '';
    }

    readonly dataGridModel$: Observable<DataGridViewModel> = this.store$.pipe(
        select(selectFormData),
        map(samples => this.viewModelCache.update(samples))
    );

    readonly cellTemplates: DataGridTemplateMap<DataGridCellContext> = {};
    readonly editorTemplates: DataGridTemplateMap<DataGridEditorContext> = {};

    @ViewChild('textCellTemplate', { static: true })
    private textCellTemplate: SamplesGridTemplateContainer<DataGridCellContext>;

    @ViewChild('dataCellTemplate', { static: true })
    private dataCellTemplate: SamplesGridTemplateContainer<DataGridCellContext>;

    @ViewChild('dataEditorTemplate', { static: true })
    private dataEditorTemplate: SamplesGridTemplateContainer<DataGridEditorContext>;

    private readonly model = samplesGridModel;
    private readonly viewModelCache = new SamplesGridViewModelCacheBySampleCount(this.model);

    private readonly columnModelMap: Record<DataGridColId, SamplesGridColumnModel> = {};

    private fileNameSubscription: Subscription;

    constructor(private readonly store$: Store<SamplesMainSlice>) {
        this.model.columns.forEach(colModel => {
            this.columnModelMap[colModel.colId] = colModel;
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

    ngOnInit(): void {
        this.cellTemplates[SamplesGridCellType.TEXT] = this.textCellTemplate.template;
        this.cellTemplates[SamplesGridCellType.DATA] = this.dataCellTemplate.template;
        this.editorTemplates[SamplesGridEditorType.DATA] = this.dataEditorTemplate.template;
    }

    ngOnDestroy(): void {
        this.fileNameSubscription.unsubscribe();
    }

    onDataEvent(e: DataGridDataEvent): void {
        const dataModel = this.columnModelMap[e.colId] as SamplesGridDataColumnModel;

        const payload: ChangedDataGridField = {
            rowIndex: this.model.getSampleIndex(e.rowId),
            columnId: dataModel.selector,
            newValue: e.data
        };

        this.store$.dispatch(new UpdateSampleDataEntrySOA(payload));
    }
}
