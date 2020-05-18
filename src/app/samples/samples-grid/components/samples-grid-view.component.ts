import { Component, ChangeDetectionStrategy, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataGridCellContext, DataGridColId, DataGridViewModel, DataGridEditorEvent, DataGridTemplateMap, DataGridEditorContext } from '../../data-grid/data-grid.model';
import { ChangedDataGridField, Sample, AnnotatedSampleDataEntry } from '../../model/sample-management.model';
import { samplesGridModel } from '../constants/model.constants';
import { SamplesGridColumnModel, SamplesGridDataColumnModel, SamplesGridCellType, SamplesGridEditorType } from '../samples-grid.model';
import { SamplesGridViewModelCacheBySampleCount } from '../view-model-cache.entity';
import { SamplesGridTemplateContainer } from './template-container';

@Component({
    selector: 'mibi-samples-grid-view',
    templateUrl: './samples-grid-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridViewComponent implements OnInit {

    get foo() {
        // console.log('samples');
        return '';
    }

    @Input() samples: Sample[];
    @Output() dataChange = new EventEmitter<ChangedDataGridField>();

    get dataGridModel(): DataGridViewModel {
        return this.viewModelCache.update(this.samples);
    }

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

    constructor() {
        this.model.columns.forEach(colModel => {
            this.columnModelMap[colModel.colId] = colModel;
        });
    }

    ngOnInit(): void {
        this.cellTemplates[SamplesGridCellType.TEXT] = this.textCellTemplate.template;
        this.cellTemplates[SamplesGridCellType.DATA] = this.dataCellTemplate.template;
        this.editorTemplates[SamplesGridEditorType.DATA] = this.dataEditorTemplate.template;
    }

    onEditorConfirm(e: DataGridEditorEvent): void {
        if (e.data === undefined) {
            return;
        }

        const dataModel = this.columnModelMap[e.colId] as SamplesGridDataColumnModel;

        const sampleIndex = this.model.getSampleIndex(e.rowId);
        const oldData = dataModel.getData(this.samples[sampleIndex], sampleIndex) as AnnotatedSampleDataEntry;

        if (oldData.value === e.data) {
            return;
        }

        this.dataChange.emit({
            rowIndex: this.model.getSampleIndex(e.rowId),
            columnId: dataModel.selector,
            newValue: e.data
        });
    }
}
