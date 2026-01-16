import { samplesEditorIdHeader, samplesEditorNrlHeader, samplesEditorDataHeaders, samplesEditorDataHeadersV18 } from './column-headers.constants';
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

function createDataModelV18(colId: DataGridColId, selector: keyof typeof samplesEditorDataHeadersV18): SamplesEditorDataColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.DATA,
        editorType: SamplesGridEditorType.DATA,
        isRowHeader: false,
        isReadOnly: false,
        headerText: samplesEditorDataHeadersV18[selector],
        getData: (sample) => sample.sampleData[selector],
        selector: selector
    };
}

const columnModels: SamplesEditorColumnModel[] = [
    createIdModel(1),
    createNrlModel(2),
    createDataModel(3, 'sample_id'),
    createDataModel(4, 'sample_id_avv'),
    createDataModel(5, 'partial_sample_id'),
    createDataModel(6, 'pathogen_avv'),
    createDataModel(7, 'pathogen_text'),
    createDataModel(8, 'sampling_date'),
    createDataModel(9, 'isolation_date'),
    createDataModel(10, 'sampling_location_avv'),
    createDataModel(11, 'sampling_location_zip'),
    createDataModel(12, 'sampling_location_text'),
    createDataModel(13, 'animal_avv'),
    createDataModel(14, 'matrix_avv'),
    createDataModel(15, 'animal_matrix_text'),
    createDataModel(16, 'primary_production_avv'),
    createDataModel(17, 'control_program_avv'),
    createDataModel(18, 'sampling_reason_avv'),
    createDataModel(19, 'program_reason_text'),
    createDataModel(20, 'operations_mode_avv'),
    createDataModel(21, 'operations_mode_text'),
    createDataModel(22, 'vvvo'),
    createDataModel(23, 'program_avv'),
    createDataModel(24, 'comment')
];

const columnModelsV18: SamplesEditorColumnModel[] = [
    createIdModel(1),
    createNrlModel(2),
    createDataModelV18(3, 'sample_id'),
    createDataModelV18(4, 'sample_id_avv'),
    createDataModelV18(5, 'partial_sample_id'),
    createDataModelV18(6, 'pathogen_avv'),
    createDataModelV18(7, 'pathogen_text'),
    createDataModelV18(8, 'sequence_id'),
    createDataModelV18(9, 'sequence_status'),
    createDataModelV18(10, 'sampling_date'),
    createDataModelV18(11, 'isolation_date'),
    createDataModelV18(12, 'sampling_location_avv'),
    createDataModelV18(13, 'sampling_location_zip'),
    createDataModelV18(14, 'sampling_location_text'),
    createDataModelV18(15, 'animal_avv'),
    createDataModelV18(16, 'matrix_avv'),
    createDataModelV18(17, 'animal_matrix_text'),
    createDataModelV18(18, 'primary_production_avv'),
    createDataModelV18(19, 'control_program_avv'),
    createDataModelV18(20, 'sampling_reason_avv'),
    createDataModelV18(21, 'program_reason_text'),
    createDataModelV18(22, 'operations_mode_avv'),
    createDataModelV18(23, 'operations_mode_text'),
    createDataModelV18(24, 'vvvo'),
    createDataModelV18(25, 'program_avv'),
    createDataModelV18(26, 'comment')
];

export const samplesEditorModel: SamplesEditorModel = {
    columns: columnModels,
    headerRowId: 0,
    headerCellType: SamplesGridCellType.TEXT,
    getSampleRowId: (index) => index + 1,
    getSampleIndex: (rowId) => rowId - 1
};

export const samplesEditorModel18: SamplesEditorModel = {
    columns: columnModelsV18,
    headerRowId: 0,
    headerCellType: SamplesGridCellType.TEXT,
    getSampleRowId: (index) => index + 1,
    getSampleIndex: (rowId) => rowId - 1
};
