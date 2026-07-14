import { ResultDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { AnnotatedSampleDataEntryDTO } from '../../../core/model/shared-dto.model';
import { AnnotatedSampleDataEntry, SampleProperty } from '../../model/sample-management.model';
import { SamplesGridCellData, SamplesGridCellType } from '../../samples-grid/samples-grid.model';
import {
    samplesEditorDataHeaders,
    samplesEditorIdHeader,
    samplesEditorNrlHeader
} from '../../samples-editor/constants/column-headers.constants';
import { ResultsGridColumnModel, ResultsGridModel } from './results-grid.model';

// The uploaded order data is already validated/submitted, so the read-only
// results view shows plain values without the editor's validation decorations:
// the DATA cell renders `value` (with the same soft-line-break wrapping as the
// editor) while errors/correction offers are stripped.
function toReadOnlyEntry(entry: AnnotatedSampleDataEntryDTO | undefined): AnnotatedSampleDataEntry {
    return {
        value: entry?.value ?? '',
        errors: [],
        correctionOffer: []
    };
}

function textColumn(
    colId: number,
    isRowHeader: boolean,
    headerText: string,
    getValue: (sample: SampleWithResultsDTO, sampleIndex: number) => SamplesGridCellData
): ResultsGridColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.TEXT,
        isRowHeader: isRowHeader,
        headerText: headerText,
        getData: getValue
    };
}

function dataColumn(colId: number, selector: SampleProperty, headerText: string): ResultsGridColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.DATA,
        isRowHeader: false,
        headerText: headerText,
        getData: sample => toReadOnlyEntry(sample.sampleData[selector])
    };
}

// A sample can carry more than one result row (e.g. Salmonella). They are shown
// as aligned stacked lines in each result column, ordered by ResultDTO.position.
function orderedResults(sample: SampleWithResultsDTO): ResultDTO[] {
    return [...sample.results].sort((a, b) => a.position - b.position);
}

function resultColumn(colId: number, key: string): ResultsGridColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.STACKED,
        isRowHeader: false,
        headerText: key,
        getData: sample => orderedResults(sample).map(result => result.resultData[key] ?? '')
    };
}

// Uploaded order columns to display (ticket #756), preceded by the row-number
// row header and the NRL column, mirroring the samples editor / mockup.
const fixedColumns: ResultsGridColumnModel[] = [
    textColumn(1, true, samplesEditorIdHeader, (_sample, index) => (index + 1).toString()),
    textColumn(2, false, samplesEditorNrlHeader, sample => sample.sampleMeta.nrl),
    dataColumn(3, 'sample_id', samplesEditorDataHeaders.sample_id),
    dataColumn(4, 'sample_id_avv', samplesEditorDataHeaders.sample_id_avv),
    dataColumn(5, 'partial_sample_id', samplesEditorDataHeaders.partial_sample_id),
    dataColumn(6, 'pathogen_avv', samplesEditorDataHeaders.pathogen_avv),
    dataColumn(7, 'animal_avv', samplesEditorDataHeaders.animal_avv),
    dataColumn(8, 'matrix_avv', samplesEditorDataHeaders.matrix_avv),
    dataColumn(9, 'animal_matrix_text', samplesEditorDataHeaders.animal_matrix_text)
];

const RESULT_COLUMN_ID_BASE = fixedColumns.length + 1;

// Fixed uploaded columns followed by the active pathogen's BfR result columns.
export function createResultsGridModel(resultColumnKeys: string[]): ResultsGridModel {
    const resultColumns = resultColumnKeys.map(
        (key, index) => resultColumn(RESULT_COLUMN_ID_BASE + index, key)
    );
    return {
        columns: [...fixedColumns, ...resultColumns],
        headerRowId: 0,
        headerCellType: SamplesGridCellType.TEXT,
        getSampleRowId: index => index + 1
    };
}
