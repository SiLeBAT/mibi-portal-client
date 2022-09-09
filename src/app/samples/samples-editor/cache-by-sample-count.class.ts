import {
    DataGridColId,
    DataGridRowId,
    DataGridMap,
    DataGridRowMap
} from '../data-grid/data-grid.model';
import { Sample } from '../model/sample-management.model';
import { SamplesGridCellData, SamplesGridCellViewModel, SamplesGridTextCellData, SamplesGridViewModel } from '../samples-grid/samples-grid.model';
import { SamplesEditorModel } from './samples-editor.model';

export class SamplesEditorCacheBySampleCount {
    private readonly headerCount = 1;

    private readonly colsCache: DataGridColId[];
    private readonly headerModelRowCache: DataGridRowMap<SamplesGridCellViewModel>;
    private readonly headerDataRowCache: DataGridRowMap<SamplesGridTextCellData>;
    private readonly modelRowCache: DataGridRowMap<SamplesGridCellViewModel>;

    private oldSamples: Sample[] = [];
    private modelCache: SamplesGridViewModel;

    constructor(private editorModel: SamplesEditorModel) {
        this.colsCache = this.editorModel.columns.map(colModel => colModel.colId);
        this.headerModelRowCache = this.createHeaderModelRow();
        this.headerDataRowCache = this.createHeaderDataRow();
        this.modelRowCache = this.createModelRow();

        this.modelCache = {
            rows: [this.editorModel.headerRowId],
            cols: this.colsCache,
            cellModels: {
                [this.editorModel.headerRowId]: this.headerModelRowCache
            },
            cellData: {
                [this.editorModel.headerRowId]: this.headerDataRowCache
            }
        };
    }

    update(samples: Sample[]): SamplesGridViewModel {
        if (samples === this.oldSamples) {
            return this.modelCache;
        }

        if (this.modelCache.rows.length !== samples.length + this.headerCount) {
            this.modelCache = this.updateModel(samples);
        }

        this.modelCache = this.updateData(this.oldSamples, samples);
        this.oldSamples = samples;

        return this.modelCache;
    }

    // Create ViewModel

    private createHeaderModelRow(): DataGridRowMap<SamplesGridCellViewModel> {
        const modelMap: DataGridRowMap<SamplesGridCellViewModel> = {};
        this.editorModel.columns.forEach(colModel => {
            modelMap[colModel.colId] = {
                isRowHeader: colModel.isRowHeader,
                isColHeader: true,
                isReadOnly: true,
                cellTemplateId: this.editorModel.headerCellType
            };
        });
        return modelMap;
    }

    private createHeaderDataRow(): DataGridRowMap<SamplesGridTextCellData> {
        const dataMap: DataGridRowMap<SamplesGridTextCellData> = {};
        this.editorModel.columns.forEach(colModel => {
            dataMap[colModel.colId] = colModel.headerText;
        });
        return dataMap;
    }

    private createModelRow(): DataGridRowMap<SamplesGridCellViewModel> {
        const modelMap: DataGridRowMap<SamplesGridCellViewModel> = {};
        this.editorModel.columns.forEach(colModel => {
            modelMap[colModel.colId] = {
                isRowHeader: colModel.isRowHeader,
                isColHeader: false,
                isReadOnly: colModel.isReadOnly,
                cellTemplateId: colModel.cellType,
                editorTemplateId: colModel.editorType
            };
        });
        return modelMap;
    }

    private createDataRow(sample: Sample, sampleIndex: number): DataGridRowMap<SamplesGridCellData> {
        const dataMap: DataGridRowMap<SamplesGridCellData> = {};
        this.editorModel.columns.forEach(colModel => {
            dataMap[colModel.colId] = colModel.getData(sample, sampleIndex);
        });
        return dataMap;
    }

    // Update Model

    private updateModel(samples: Sample[]): SamplesGridViewModel {
        const rows: DataGridRowId[] = [this.editorModel.headerRowId];
        const modelMap: DataGridMap<SamplesGridCellViewModel> = {
            [this.editorModel.headerRowId]: this.headerModelRowCache
        };

        samples.forEach((_sample, index) => {
            const rowId = this.editorModel.getSampleRowId(index);
            rows.push(rowId);
            modelMap[rowId] = this.modelRowCache;
        });

        return {
            ...this.modelCache,
            rows: rows,
            cellModels: modelMap
        };
    }

    // Update Data

    private updateData(oldSamples: Sample[], samples: Sample[]): SamplesGridViewModel {
        const oldDataMap = this.modelCache.cellData;
        const dataMap: DataGridMap<SamplesGridCellData> = {};

        dataMap[this.editorModel.headerRowId] = this.headerDataRowCache;

        samples.forEach((sample, index) => {
            const rowId = this.editorModel.getSampleRowId(index);
            if (!oldSamples[index]) {
                dataMap[rowId] = this.createDataRow(sample, index);
            } else {
                dataMap[rowId] = this.updateDataRow(oldSamples[index], sample, index, oldDataMap[rowId]);
            }
        });

        return {
            ...this.modelCache,
            cellData: dataMap
        };
    }

    private updateDataRow(
        oldSample: Sample,
        newSample: Sample,
        sampleIndex: number,
        oldDataMap: DataGridRowMap<SamplesGridCellData>
    ): DataGridRowMap<SamplesGridCellData> {
        if (newSample === oldSample) {
            return oldDataMap;
        }

        const dataMap: DataGridRowMap<SamplesGridCellData> = {};

        this.editorModel.columns.forEach(colModel => {
            const oldData = colModel.getData(oldSample, sampleIndex);
            const newData = colModel.getData(newSample, sampleIndex);

            if (newData !== oldData) {
                dataMap[colModel.colId] = newData;
            } else {
                dataMap[colModel.colId] = oldDataMap[colModel.colId];
            }
        });

        return dataMap;
    }
}
