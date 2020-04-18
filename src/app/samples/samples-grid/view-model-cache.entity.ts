import { DataGridCellViewModel, DataGridViewModel, DataGridRowViewModel } from '../data-grid/view-model.model';
import { Sample } from '../model/sample-management.model';
import { SamplesGridModel } from './samples-grid.model';

export class SamplesGridViewModelCacheBySampleCount {
    private readonly model: SamplesGridModel;
    private readonly headerCount = 1;

    private readonly headerCellViewModels: DataGridCellViewModel[];
    private readonly dataCellViewModels: DataGridCellViewModel[];

    private viewModel: DataGridViewModel;

    constructor(model: SamplesGridModel) {
        this.model = model;
        this.headerCellViewModels = this.createHeaderCellViewModels();
        this.dataCellViewModels = this.createDataCellViewModels();
        this.createViewModel([]);
    }

    getViewModel(samples: Sample[]): DataGridViewModel {
        if (this.viewModel.rowCount !== samples.length + this.headerCount) {
            this.createViewModel(samples);
        }

        return this.viewModel;
    }

    private createHeaderCellViewModels(): DataGridCellViewModel[] {
        return this.model.columns.map(model => {
            return {
                uId: model.colId,
                isRowHeader: model.isRowHeader,
                isColHeader: true,
                isReadOnly: true
            };
        });
    }

    private createDataCellViewModels(): DataGridCellViewModel[] {
        return this.model.columns.map(model => {
            return {
                uId: model.colId,
                isRowHeader: model.isRowHeader,
                isColHeader: false,
                isReadOnly: model.isReadOnly
            };
        });
    }

    private createViewModel(samples: Sample[]): void {
        const rows: DataGridRowViewModel[] = [];
        rows.push({ cells: this.headerCellViewModels, uId: this.model.headerRowId });
        samples.forEach((sample, index) => {
            rows.push({ cells: this.dataCellViewModels, uId: this.model.getSampleRowId(index) });
        });

        this.viewModel = {
            rows: rows,
            colCount: this.model.columns.length,
            rowCount: rows.length
        };
    }
}
