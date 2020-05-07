import { samplesGridIdHeader, samplesGridNrlHeader, samplesGridSampleDataHeaders } from './column-headers.constants';
import {
    SamplesGridColumnModel,
    SamplesGridColumnType,
    SamplesGridDataColumnModel,
    SamplesGridModel
} from '../samples-grid.model';
import { DataGridColId } from '../../data-grid/data-grid.model';

function createIdModel(colId: DataGridColId): SamplesGridColumnModel {
    return {
        colId: colId,
        type: SamplesGridColumnType.ID,
        isRowHeader: true,
        isReadOnly: true,
        headerText: samplesGridIdHeader,
        getData: (sample, sampleIndex) => (sampleIndex + 1).toString()
    };
}

function createNrlModel(colId: DataGridColId): SamplesGridColumnModel {
    return {
        colId: colId,
        type: SamplesGridColumnType.NRL,
        isRowHeader: false,
        isReadOnly: true,
        headerText: samplesGridNrlHeader,
        getData: (sample) => sample.sampleMeta.nrl
    };
}

function createDataModel(colId: DataGridColId, selector: keyof typeof samplesGridSampleDataHeaders): SamplesGridDataColumnModel {
    return {
        colId: colId,
        type: SamplesGridColumnType.DATA,
        isRowHeader: false,
        isReadOnly: false,
        headerText: samplesGridSampleDataHeaders[selector],
        getData: (sample) => sample.sampleData[selector],
        selector: selector
    };
}

const columnModels: SamplesGridColumnModel[] = [
    createIdModel(1),
    createNrlModel(2),
    createDataModel(3, 'sample_id'),
    createDataModel(4, 'sample_id_avv'),
    createDataModel(5, 'pathogen_adv'),
    createDataModel(6, 'pathogen_text'),
    createDataModel(7, 'sampling_date'),
    createDataModel(8, 'isolation_date'),
    createDataModel(9, 'sampling_location_adv'),
    createDataModel(10, 'sampling_location_zip'),
    createDataModel(11, 'sampling_location_text'),
    createDataModel(12, 'topic_adv'),
    createDataModel(13, 'matrix_adv'),
    createDataModel(14, 'matrix_text'),
    createDataModel(15, 'process_state_adv'),
    createDataModel(16, 'sampling_reason_adv'),
    createDataModel(17, 'sampling_reason_text'),
    createDataModel(18, 'operations_mode_adv'),
    createDataModel(19, 'operations_mode_text'),
    createDataModel(20, 'vvvo'),
    createDataModel(21, 'comment')
];

export const samplesGridModel: SamplesGridModel = {
    columns: columnModels,
    headerRowId: 0,
    getSampleRowId: (index) => index + 1,
    getSampleIndex: (rowId) => rowId - 1
};
