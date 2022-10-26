import { samplesEditorIdHeader, samplesEditorNrlHeader, samplesEditorDataHeaders } from './column-headers.constants';
import {
    SamplesGridCellType,
    SamplesGridEditorType
} from '../../samples-grid/samples-grid.model';
import {
    SamplesEditorColumnModel,
    SamplesEditorDataColumnModel,
    SamplesEditorModel
} from '../samples-editor.model';
import { DataGridColId } from '../../data-grid/data-grid.model';

function createIdModel(colId: DataGridColId): SamplesEditorColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.TEXT,
        isRowHeader: true,
        isReadOnly: true,
        headerText: samplesEditorIdHeader,
        getData: (_sample, sampleIndex) => (sampleIndex + 1).toString()
    };
}

function createNrlModel(colId: DataGridColId): SamplesEditorColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.TEXT,
        isRowHeader: false,
        isReadOnly: true,
        headerText: samplesEditorNrlHeader,
        getData: (sample) => sample.sampleMeta.nrl
    };
}

function createDataModel(colId: DataGridColId, selector: keyof typeof samplesEditorDataHeaders): SamplesEditorDataColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.DATA,
        editorType: SamplesGridEditorType.DATA,
        isRowHeader: false,
        isReadOnly: false,
        headerText: samplesEditorDataHeaders[selector],
        getData: (sample) => sample.sampleData[selector],
        selector: selector
    };
}

const columnModels: SamplesEditorColumnModel[] = [
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

export const samplesEditorModel: SamplesEditorModel = {
    columns: columnModels,
    headerRowId: 0,
    headerCellType: SamplesGridCellType.TEXT,
    getSampleRowId: (index) => index + 1,
    getSampleIndex: (rowId) => rowId - 1
};
