import { Sample } from '../model/sample-management.model';
import { DataGridCellViewModel } from '../data-grid/view-model.model';
import { samplesGridSampleDataHeaders, samplesGridIdHeader, samplesGridNrlHeader } from './column-headers.constants';

const defaultColHeaderCellConfig = {
    isReadOnly: true,
    isColHeader: true,
    isRowHeader: false
};

const defaultRowHeaderCellConfig = {
    isReadOnly: true,
    isColHeader: false,
    isRowHeader: true
};

const defaultDataCellConfig = {
    isReadOnly: false,
    isColHeader: false,
    isRowHeader: false
};

export interface SamplesGridColumnDefinition {
    getHeaderCellViewModel: () => DataGridCellViewModel;
    getDataCellViewModel: (sample: Sample, sampleId: number) => DataGridCellViewModel;
    getSampleDataSelector?: () => string;
}

function createIdColumnDefinition(colId: number): SamplesGridColumnDefinition {
    return {
        getHeaderCellViewModel: () => {
            return {
                ...defaultColHeaderCellConfig,
                isRowHeader: true,
                uId: colId,
                value: samplesGridIdHeader
            };
        },
        getDataCellViewModel: (sample, sampleId) => {
            return {
                ...defaultRowHeaderCellConfig,
                uId: colId,
                value: sampleId.toString()
            };
        }
    };
}

function createNrlColumnDefinition(colId: number): SamplesGridColumnDefinition {
    return {
        getHeaderCellViewModel: () => {
            return {
                ...defaultColHeaderCellConfig,
                uId: colId,
                value: samplesGridNrlHeader
            };
        },
        getDataCellViewModel: (sample, sampleId) => {
            return {
                ...defaultDataCellConfig,
                isReadOnly: true,
                uId: colId,
                value: sample.sampleMeta.nrl
            };
        }
    };
}

function createSampleDataColumnDefinition(colId: number, selector: keyof typeof samplesGridSampleDataHeaders): SamplesGridColumnDefinition {
    return {
        getHeaderCellViewModel: () => {
            return {
                ...defaultColHeaderCellConfig,
                uId: colId,
                value: samplesGridSampleDataHeaders[selector]
            };
        },
        getDataCellViewModel: (sample) => {
            return {
                ...defaultDataCellConfig,
                uId: colId,
                value: sample.sampleData[selector].value
            };
        },
        getSampleDataSelector: () => selector
    };
}

export const samplesGridColumnDefinitions: SamplesGridColumnDefinition[] = [
    createIdColumnDefinition(1),
    createNrlColumnDefinition(2),
    createSampleDataColumnDefinition(3, 'sample_id'),
    createSampleDataColumnDefinition(4, 'sample_id_avv'),
    createSampleDataColumnDefinition(5, 'pathogen_adv'),
    createSampleDataColumnDefinition(6, 'pathogen_text'),
    createSampleDataColumnDefinition(7, 'sampling_date'),
    createSampleDataColumnDefinition(8, 'isolation_date'),
    createSampleDataColumnDefinition(9, 'sampling_location_adv'),
    createSampleDataColumnDefinition(10, 'sampling_location_zip'),
    createSampleDataColumnDefinition(11, 'sampling_location_text'),
    createSampleDataColumnDefinition(12, 'topic_adv'),
    createSampleDataColumnDefinition(13, 'matrix_adv'),
    createSampleDataColumnDefinition(14, 'matrix_text'),
    createSampleDataColumnDefinition(15, 'process_state_adv'),
    createSampleDataColumnDefinition(16, 'sampling_reason_adv'),
    createSampleDataColumnDefinition(17, 'sampling_reason_text'),
    createSampleDataColumnDefinition(18, 'operations_mode_adv'),
    createSampleDataColumnDefinition(19, 'operations_mode_text'),
    createSampleDataColumnDefinition(20, 'vvvo'),
    createSampleDataColumnDefinition(21, 'comment')
];
