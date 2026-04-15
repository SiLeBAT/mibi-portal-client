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
    createDataModel(5, 'partial_sample_id'),
    createDataModel(6, 'pathogen_avv'),
    createDataModel(7, 'pathogen_text'),
    createDataModel(8, 'sequence_id'),
    createDataModel(9, 'sequence_status'),
    createDataModel(10, 'sampling_date'),
    createDataModel(11, 'isolation_date'),
    createDataModel(12, 'sampling_location_avv'),
    createDataModel(13, 'sampling_location_zip'),
    createDataModel(14, 'sampling_location_text'),
    createDataModel(15, 'animal_avv'),
    createDataModel(16, 'matrix_avv'),
    createDataModel(17, 'animal_matrix_text'),
    createDataModel(18, 'additional_marks_avv'),
    createDataModel(19, 'control_program_avv'),
    createDataModel(20, 'sampling_reason_avv'),
    createDataModel(21, 'program_reason_text'),
    createDataModel(22, 'operations_mode_avv'),
    createDataModel(23, 'operations_mode_text'),
    createDataModel(24, 'vvvo'),
    createDataModel(25, 'program_avv'),
    createDataModel(26, 'comment')
];

export const samplesEditorModel: SamplesEditorModel = {
    columns: columnModels,
    headerRowId: 0,
    headerCellType: SamplesGridCellType.TEXT,
    getSampleRowId: (index) => index + 1,
    getSampleIndex: (rowId) => rowId - 1
};
