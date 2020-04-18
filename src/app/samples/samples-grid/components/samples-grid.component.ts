import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DataGridViewModel, DataGridEditorEvent } from '../../data-grid/view-model.model';
import { Sample, AnnotatedSampleDataEntry, ChangedDataGridField } from '../../model/sample-management.model';
import { samplesGridModel } from '../constants/model.constants';
import { SamplesGridColumnModel, SamplesGridColumnType, SamplesGridNrlModel, SamplesGridDataModel, SamplesGridIdModel } from '../samples-grid.model';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectFormData } from '../../state/samples.selectors';
import { SamplesMainSlice } from '../../samples.state';
import { UpdateActionItemsSOA } from '../../../core/state/core.actions';
import { UserActionType } from '../../../shared/model/user-action.model';
import { map, tap } from 'rxjs/operators';
import { SamplesGridViewModelCacheBySampleCount } from '../view-model-cache.entity';
import { UpdateSampleDataEntrySOA } from '../../state/samples.actions';

@Component({
    templateUrl: './samples-grid.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridComponent implements OnInit {

    $dataGridModel: Observable<DataGridViewModel> = this.$store.pipe(
        select(selectFormData),
        tap(samples => {
            this.samples = samples;
        }),
        map(samples => this.viewModelCache.getViewModel(samples))
    );

    editorData: string = '';

    get idType(): SamplesGridColumnType {
        return SamplesGridColumnType.ID;
    }

    get nrlType(): SamplesGridColumnType {
        return SamplesGridColumnType.NRL;
    }

    get dataType(): SamplesGridColumnType {
        return SamplesGridColumnType.DATA;
    }

    private samples: Sample[];

    private readonly model = samplesGridModel;
    private readonly colMap: Record<number, SamplesGridColumnModel> = {};
    private readonly viewModelCache = new SamplesGridViewModelCacheBySampleCount(this.model);

    constructor(private $store: Store<SamplesMainSlice>) {
        this.model.columns.forEach(col => {
            this.colMap[col.colId] = col;
        });
    }

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

    onEditorOpen(e: DataGridEditorEvent): void {
        this.editorData = this.getData(e.rowId, e.cellId).value;
    }

    onEditorConfirm(e: DataGridEditorEvent): void {
        const dataModel = this.colMap[e.cellId] as SamplesGridDataModel;

        const payload: ChangedDataGridField = {
            rowIndex: this.model.getSampleIndex(e.rowId),
            columnId: dataModel.selector,
            newValue: this.editorData
        };

        this.$store.dispatch(new UpdateSampleDataEntrySOA(payload));

        this.editorData = '';
    }

    isHeader(rowId: number): boolean {
        return this.model.headerRowId === rowId;
    }

    getCellType(colId: number): SamplesGridColumnType {
        return this.colMap[colId].type;
    }

    getHeaderText(colId: number): string {
        return this.colMap[colId].headerText;
    }

    getId(rowId: number, colId: number): string {
        return (this.colMap[colId] as SamplesGridIdModel).getId(rowId);
    }

    getNrl(rowId: number, colId: number): string {
        const sample = this.samples[this.model.getSampleIndex(rowId)];
        return (this.colMap[colId] as SamplesGridNrlModel).getNrl(sample);
    }

    getData(rowId: number, colId: number): AnnotatedSampleDataEntry {
        const sample = this.samples[this.model.getSampleIndex(rowId)];
        return (this.colMap[colId] as SamplesGridDataModel).getData(sample);
    }
}
