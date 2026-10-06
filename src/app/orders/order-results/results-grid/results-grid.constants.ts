import { ResultDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { AnnotatedSampleDataEntryDTO } from '../../../core/model/shared-dto.model';
import { AnnotatedSampleDataEntry, SampleProperty } from '../../../samples/model/sample-management.model';
import { dataGridDefaultTrack, dataGridRowHeaderTrack } from '../../../grid/data-grid/data-grid.constants';
import { SamplesGridCellData, SamplesGridCellType } from '../../../grid/samples-grid/samples-grid.model';
import {
    samplesEditorDataHeaders,
    samplesEditorIdHeader,
    samplesEditorNrlHeader
} from '../../../samples/samples-editor/constants/column-headers.constants';
import { ResultsGridColumnModel, ResultsGridModel } from './results-grid.model';
import { ResultColumnDefinition } from './nrl-results-catalog';

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
export function orderedResults(sample: SampleWithResultsDTO): ResultDTO[] {
    return [...sample.results].sort((a, b) => a.position - b.position);
}

function resultColumn(colId: number, definition: ResultColumnDefinition): ResultsGridColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.STACKED,
        isRowHeader: false,
        headerText: definition.header,
        getData: sample => orderedResults(sample).map(result => result.resultData[definition.key] ?? ''),
        fill: true
    };
}

// The in-grid separator/toggle column (mockup #7/#9). It renders as a coloured
// bar with the label in the sticky header cell; the results view turns clicks on
// it into the show-all-data toggle. Every cell of the column carries the label so
// the bar shows the mouse-over text over its whole height (ticket #836); only the
// header cell renders it as visible text.
function toggleColumn(colId: number, label: string): ResultsGridColumnModel {
    return {
        colId: colId,
        cellType: SamplesGridCellType.TOGGLE,
        isRowHeader: false,
        headerText: '',
        headerCellType: SamplesGridCellType.TOGGLE,
        getHeaderData: () => label,
        getData: () => label
    };
}

function idColumn(): ResultsGridColumnModel {
    return textColumn(1, true, samplesEditorIdHeader, (_sample, index) => (index + 1).toString());
}

function nrlColumn(): ResultsGridColumnModel {
    return textColumn(2, false, samplesEditorNrlHeader, sample => sample.sampleMeta.nrl);
}

// Unlike the other left-hand columns, the BfR order number is not part of the
// uploaded order data: the LIMS delivers it with the results, so it arrives as a
// property of resultData (ticket #856). A sample's results all belong to the
// same BfR order, hence the first result's value stands for the whole sample.
export const bfrOrderNumberKey = 'BfR-Auftragsnummer';
export const bfrOrderNumberHeader = 'BfR-Auftrags­nummer';

// The value shown for the whole sample, used by the grid cell and by the CSV
// download so the file says what the screen says.
export function bfrOrderNumber(sample: SampleWithResultsDTO): string {
    return orderedResults(sample)[0]?.resultData[bfrOrderNumberKey] ?? '';
}

function bfrOrderNumberColumn(colId: number): ResultsGridColumnModel {
    return textColumn(colId, false, bfrOrderNumberHeader, sample => bfrOrderNumber(sample));
}

// The Erreger column is headed differently in the two views: next to the BfR
// results it says what the sample was submitted as, while the full-data view
// keeps the samples-editor header (ticket #856).
export const resultsViewPathogenHeader = 'Erreger: Eingesendet als';

// Uploaded order columns to display in the results view (ticket #756), preceded
// by the row-number row header and the NRL column, mirroring the samples editor,
// with the LIMS-supplied BfR order number in sixth place (ticket #856).
const fixedColumns: ResultsGridColumnModel[] = [
    idColumn(),
    nrlColumn(),
    dataColumn(3, 'sample_id', samplesEditorDataHeaders.sample_id),
    dataColumn(4, 'sample_id_avv', samplesEditorDataHeaders.sample_id_avv),
    dataColumn(5, 'partial_sample_id', samplesEditorDataHeaders.partial_sample_id),
    bfrOrderNumberColumn(6),
    dataColumn(7, 'pathogen_avv', resultsViewPathogenHeader),
    dataColumn(8, 'animal_avv', samplesEditorDataHeaders.animal_avv),
    dataColumn(9, 'matrix_avv', samplesEditorDataHeaders.matrix_avv),
    dataColumn(10, 'animal_matrix_text', samplesEditorDataHeaders.animal_matrix_text)
];

const TOGGLE_COLUMN_ID = fixedColumns.length + 1;
const RESULT_COLUMN_ID_BASE = fixedColumns.length + 2;

// Fixed uploaded columns, then the toggle bar (between the two blocks), then the
// active NRL's BfR result columns.
export function createResultsGridModel(resultColumnDefinitions: ResultColumnDefinition[]): ResultsGridModel {
    const resultColumns = resultColumnDefinitions.map(
        (definition, index) => resultColumn(RESULT_COLUMN_ID_BASE + index, definition)
    );
    return {
        columns: [
            ...fixedColumns,
            toggleColumn(TOGGLE_COLUMN_ID, 'Alle Auftragsdaten anzeigen: Hier klicken'),
            ...resultColumns
        ],
        headerRowId: 0,
        headerCellType: SamplesGridCellType.TEXT,
        getSampleRowId: index => index + 1
    };
}

// All uploaded order columns in samples-editor order, for the full-data view
// (mockup #7 "Alle Auftragsdaten anzeigen"). No BfR result columns.
const allDataSelectors = Object.keys(samplesEditorDataHeaders) as SampleProperty[];

export function createFullDataGridModel(): ResultsGridModel {
    const dataColumns = allDataSelectors.map(
        (selector, index) => dataColumn(3 + index, selector, samplesEditorDataHeaders[selector])
    );
    const toggleColId = 3 + dataColumns.length;
    return {
        columns: [
            idColumn(),
            nrlColumn(),
            ...dataColumns,
            toggleColumn(toggleColId, 'BfR-Ergebnisse anzeigen: Hier klicken')
        ],
        headerRowId: 0,
        headerCellType: SamplesGridCellType.TEXT,
        getSampleRowId: index => index + 1
    };
}

// grid-template-columns for the results grid: uploaded/toggle columns keep their
// content width (auto), BfR result columns share the remaining width (1fr each)
// so the results block always spans to the end of the page with equal widths.
// The row-number column uses the shared data-grid track, so it is exactly as wide
// here as in the samples editor (ticket #841).
export function gridColumnTemplate(model: ResultsGridModel): string {
    return model.columns
        .map(column => column.isRowHeader
            ? dataGridRowHeaderTrack
            : (column.fill ? '1fr' : dataGridDefaultTrack))
        .join(' ');
}
