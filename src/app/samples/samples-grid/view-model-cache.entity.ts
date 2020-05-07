import { DataGridCellViewModel, DataGridColId, DataGridViewModel, DataGridCellData, DataGridRowId, DataGridMap, DataGridRowMap } from '../data-grid/data-grid.model';
import { Sample } from '../model/sample-management.model';
import { SamplesGridModel } from './samples-grid.model';

export class SamplesGridViewModelCacheBySampleCount {
    private readonly headerCount = 1;

    private readonly cols: DataGridColId[];

    private readonly headerRowModelMap: DataGridRowMap<DataGridCellViewModel>;
    private readonly headerRowDataMap: DataGridRowMap<DataGridCellData>;

    private oldSamples: Sample[] = [];
    private viewModel: DataGridViewModel;

    constructor(private model: SamplesGridModel) {
        this.cols = this.model.columns.map(colModel => colModel.colId);
        this.headerRowModelMap = this.createHeaderRowModelMap();
        this.headerRowDataMap = this.createHeaderRowDataMap();

        this.viewModel = {
            rows: [this.model.headerRowId],
            cols: this.cols,
            cellModels: {},
            cellData: {}
        };
        this.viewModel.cellModels[this.model.headerRowId] = this.headerRowModelMap;
        this.viewModel.cellData[this.model.headerRowId] = this.headerRowDataMap;
    }

    getViewModel(samples: Sample[]): DataGridViewModel {
        if (this.viewModel.rows.length !== samples.length + this.headerCount) {
            this.viewModel = this.createViewModel(samples);
        } else {
            this.viewModel = this.updateData(samples);
        }

        this.oldSamples = samples;
        return this.viewModel;
    }

    // Create ViewModel

    private createViewModel(samples: Sample[]): DataGridViewModel {
        const rows: DataGridRowId[] = [];
        const modelMap: DataGridMap<DataGridCellViewModel> = {};
        const dataMap: DataGridMap<DataGridCellData> = {};

        let rowId = this.model.headerRowId;
        rows.push(rowId);
        modelMap[rowId] = this.headerRowModelMap;
        dataMap[rowId] = this.headerRowDataMap;

        samples.forEach((sample, index) => {
            rowId = this.model.getSampleRowId(index);
            rows.push(rowId);
            modelMap[rowId] = this.createDataRowModelMap();
            dataMap[rowId] = this.createDataRowDataMap(sample, index);
        });

        return {
            rows: rows,
            cols: this.cols,
            cellModels: modelMap,
            cellData: dataMap
        };
    }

    private createHeaderRowModelMap(): DataGridRowMap<DataGridCellViewModel> {
        const modelMap: DataGridRowMap<DataGridCellViewModel> = {};
        this.model.columns.forEach(colModel => {
            modelMap[colModel.colId] = {
                isRowHeader: colModel.isRowHeader,
                isColHeader: true,
                isReadOnly: true
            };
        });
        return modelMap;
    }

    private createHeaderRowDataMap(): DataGridRowMap<DataGridCellData> {
        const dataMap: DataGridRowMap<DataGridCellData> = {};
        this.model.columns.forEach(colModel => {
            dataMap[colModel.colId] = colModel.headerText;
        });
        return dataMap;
    }

    private createDataRowModelMap(): DataGridRowMap<DataGridCellViewModel> {
        const modelMap: Record<DataGridColId, DataGridCellViewModel> = {};
        this.model.columns.forEach(colModel => {
            modelMap[colModel.colId] = {
                isRowHeader: colModel.isRowHeader,
                isColHeader: false,
                isReadOnly: colModel.isReadOnly
            };
        });
        return modelMap;
    }

    private createDataRowDataMap(sample: Sample, sampleIndex: number): DataGridRowMap<DataGridCellData> {
        const dataMap: DataGridRowMap<DataGridCellData> = {};
        this.model.columns.forEach(colModel => {
            dataMap[colModel.colId] = colModel.getData(sample, sampleIndex);
        });
        return dataMap;
    }

    // Update Data

    private updateData(samples: Sample[]): DataGridViewModel {
        const oldDataMap = this.viewModel.cellData;
        const dataMap: DataGridMap<DataGridCellData> = {};

        let rowId = this.model.headerRowId;
        dataMap[rowId] = oldDataMap[rowId];

        samples.forEach((sample, index) => {
            rowId = index + this.headerCount;
            const oldSample = this.oldSamples[index];
            dataMap[rowId] = this.updateDataRow(oldSample, sample, index, oldDataMap[rowId]);
        });

        return {
            ...this.viewModel,
            cellData: dataMap
        };
    }

    private updateDataRow(
        oldSample: Sample,
        newSample: Sample,
        sampleIndex: number,
        oldDataMap: DataGridRowMap<DataGridCellData>
    ): DataGridRowMap<DataGridCellData> {
        if (newSample === oldSample) {
            return oldDataMap;
        }

        const dataMap: DataGridRowMap<DataGridCellData> = {};

        this.model.columns.forEach((colModel, index) => {
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
