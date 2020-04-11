import { createSelector } from '@ngrx/store';
import { selectFormData } from '../state/samples.selectors';
import { DataGridRowViewModel, DataGridViewModel } from '../data-grid/view-model.model';
import { Sample } from '../model/sample-management.model';
import { SamplesGridColumnDefinition, samplesGridColumnDefinitions } from './column-definitions.constants';

export const selectSampleGridViewModel = createSelector(selectFormData, formData =>
    createViewModel(formData, samplesGridColumnDefinitions)
);

function createViewModel(samples: Sample[], colDefs: SamplesGridColumnDefinition[]): DataGridViewModel {
    const rows: DataGridRowViewModel[] = [];
    rows.push(createHeaderRowViewModel(1, colDefs));
    samples.forEach((sample, index) => {
        rows.push(createDataRowViewModel(index + 2, sample, colDefs));
    });

    return {
        rowCount: samples.length + 1,
        colCount: colDefs.length,
        rows: rows
    };
}

function createHeaderRowViewModel(rowId: number, colDefs: SamplesGridColumnDefinition[]): DataGridRowViewModel {
    const cols = colDefs.map(colDef => colDef.getHeaderCellViewModel());
    return {
        uId: rowId,
        cols: cols
    };
}

function createDataRowViewModel(rowId: number, sample: Sample, colDefs: SamplesGridColumnDefinition[]): DataGridRowViewModel {
    const cols = colDefs.map(colDef => colDef.getDataCellViewModel(sample, rowId - 1));
    return {
        uId: rowId,
        cols: cols
    };
}
