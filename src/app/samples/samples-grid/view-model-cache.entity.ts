import {
    DataGridCellViewModel,
    DataGridColId,
    DataGridViewModel,
    DataGridCellData,
    DataGridRowId,
    DataGridMap,
    DataGridRowMap
} from '../data-grid/data-grid.model';
import { Sample } from '../model/sample-management.model';
import { SamplesGridModel } from './samples-grid.model';

export class SamplesGridViewModelCacheBySampleCount {
    private readonly headerCount = 1;

    private readonly cols: DataGridColId[];
    private readonly headerModelRowMap: DataGridRowMap<DataGridCellViewModel>;
    private readonly headerDataRowMap: DataGridRowMap<DataGridCellData>;
    private readonly modelRowMap: DataGridRowMap<DataGridCellViewModel>;

    private oldSamples: Sample[] = [];
    private viewModel: DataGridViewModel;

    constructor(private model: SamplesGridModel) {
        this.cols = this.model.columns.map(colModel => colModel.colId);
        this.headerModelRowMap = this.createHeaderModelRowMap();
        this.headerDataRowMap = this.createHeaderDataRowMap();
        this.modelRowMap = this.createModelRowMap();

        this.viewModel = {
            rows: [this.model.headerRowId],
            cols: this.cols,
            cellModels: {
                [this.model.headerRowId]: this.headerModelRowMap
            },
            cellData: {
                [this.model.headerRowId]: this.headerDataRowMap
            }
        };
    }

    update(samples: Sample[]): DataGridViewModel {
        if (samples === this.oldSamples) {
            return this.viewModel;
        }

        if (this.viewModel.rows.length !== samples.length + this.headerCount) {
            this.viewModel = this.updateModel(samples);
        }

        this.viewModel = this.updateData(this.oldSamples, samples);
        this.oldSamples = samples;

        return this.viewModel;
    }

    // Create ViewModel

    private createHeaderModelRowMap(): DataGridRowMap<DataGridCellViewModel> {
        const modelMap: DataGridRowMap<DataGridCellViewModel> = {};
        this.model.columns.forEach(colModel => {
            modelMap[colModel.colId] = {
                isRowHeader: colModel.isRowHeader,
                isColHeader: true,
                isReadOnly: true,
                cellTemplateId: this.model.headerCellType
            };
        });
        return modelMap;
    }

    private createHeaderDataRowMap(): DataGridRowMap<DataGridCellData> {
        const dataMap: DataGridRowMap<DataGridCellData> = {};
        this.model.columns.forEach(colModel => {
            dataMap[colModel.colId] = colModel.headerText;
        });
        return dataMap;
    }

    private createModelRowMap(): DataGridRowMap<DataGridCellViewModel> {
        const modelMap: DataGridRowMap<DataGridCellViewModel> = {};
        this.model.columns.forEach(colModel => {
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

    private createDataRowMap(sample: Sample, sampleIndex: number): DataGridRowMap<DataGridCellData> {
        const dataMap: DataGridRowMap<DataGridCellData> = {};
        this.model.columns.forEach(colModel => {
            dataMap[colModel.colId] = colModel.getData(sample, sampleIndex);
        });
        return dataMap;
    }

    // Update Model

    private updateModel(samples: Sample[]): DataGridViewModel {
        const rows: DataGridRowId[] = [this.model.headerRowId];
        const modelMap: DataGridMap<DataGridCellViewModel> = {
            [this.model.headerRowId]: this.headerModelRowMap
        };

        samples.forEach((sample, index) => {
            const rowId = this.model.getSampleRowId(index);
            rows.push(rowId);
            modelMap[rowId] = this.modelRowMap;
        });

        return {
            ...this.viewModel,
            rows: rows,
            cellModels: modelMap
        };
    }

    // Update Data

    private updateData(oldSamples: Sample[], samples: Sample[]): DataGridViewModel {
        const oldDataMap = this.viewModel.cellData;
        const dataMap: DataGridMap<DataGridCellData> = {};

        dataMap[this.model.headerRowId] = this.headerDataRowMap;

        samples.forEach((sample, index) => {
            const rowId = this.model.getSampleRowId(index);
            if (!oldSamples[index]) {
                dataMap[rowId] = this.createDataRowMap(sample, index);
            } else {
                dataMap[rowId] = this.updateDataRowMap(oldSamples[index], sample, index, oldDataMap[rowId]);
            }
        });

        return {
            ...this.viewModel,
            cellData: dataMap
        };
    }

    private updateDataRowMap(
        oldSample: Sample,
        newSample: Sample,
        sampleIndex: number,
        oldDataMap: DataGridRowMap<DataGridCellData>
    ): DataGridRowMap<DataGridCellData> {
        if (newSample === oldSample) {
            return oldDataMap;
        }

        const dataMap: DataGridRowMap<DataGridCellData> = {};

        this.model.columns.forEach(colModel => {
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
