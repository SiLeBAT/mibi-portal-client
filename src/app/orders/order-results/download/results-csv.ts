import { ResultDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { SampleProperty } from '../../../samples/model/sample-management.model';
import { samplesEditorDataHeaders } from '../../../samples/samples-editor/constants/column-headers.constants';
import { ResultColumnDefinition, getResultColumns } from '../results-grid/nrl-results-catalog';
import {
    bfrOrderNumber,
    bfrOrderNumberHeader,
    orderedResults,
    resultsViewPathogenHeader
} from '../results-grid/results-grid.constants';

export interface DownloadColumn {
    header: string;
    getValue(sample: SampleWithResultsDTO, result: ResultDTO | undefined): string;
}

// The 3 sample-number columns from the uploaded data, in the same order as the
// results view (ticket #786). The BfR order number and the pathogen (Erreger)
// column follow them, both added separately: the former is not uploaded data and
// the latter is headed as in the results view rather than as in the editor.
const SAMPLE_COLUMN_SELECTORS: SampleProperty[] = [
    'sample_id',
    'sample_id_avv',
    'partial_sample_id'
];

function stripSoftHyphens(text: string): string {
    return text.replace(/\u00AD/g, '');
}

function sampleColumn(selector: SampleProperty, header: string): DownloadColumn {
    return {
        header: stripSoftHyphens(header),
        getValue: sample => sample.sampleData[selector]?.value ?? ''
    };
}

// Taken from the sample rather than from the row's own result, so that a
// multi-result sample repeats the one number the results view shows for it
// (ticket #856).
const bfrOrderNumberDownloadColumn: DownloadColumn = {
    header: stripSoftHyphens(bfrOrderNumberHeader),
    getValue: sample => bfrOrderNumber(sample)
};

function resultDownloadColumn(definition: ResultColumnDefinition): DownloadColumn {
    return {
        header: definition.header,
        getValue: (_sample, result) => result?.resultData[definition.key] ?? ''
    };
}

/**
 * CSV columns for an NRL: the sample-number columns, the BfR order number
 * and the pathogen column, then that NRL's result columns — matching the
 * on-screen results order and headers.
 */
export function downloadColumnsForNrl(nrlId: string): DownloadColumn[] {
    return [
        ...SAMPLE_COLUMN_SELECTORS.map(
            selector => sampleColumn(selector, samplesEditorDataHeaders[selector])
        ),
        bfrOrderNumberDownloadColumn,
        sampleColumn('pathogen_avv', resultsViewPathogenHeader),
        ...getResultColumns(nrlId).map(definition => resultDownloadColumn(definition))
    ];
}

function csvField(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Builds the CSV text: a header row followed by one row per result (multi-result
 * samples are flattened, repeating the sample/pathogen columns; a sample without
 * results still yields one row). Comma-delimited, every value quoted, CRLF line
 * endings, prefixed with a UTF-8 BOM so German Excel reads the encoding.
 */
export function buildResultsCsv(columns: DownloadColumn[], samples: SampleWithResultsDTO[]): string {
    const lines: string[] = [columns.map(column => csvField(column.header)).join(',')];

    for (const sample of samples) {
        const results = orderedResults(sample);
        const rows: (ResultDTO | undefined)[] = results.length > 0 ? results : [undefined];
        for (const result of rows) {
            lines.push(columns.map(column => csvField(column.getValue(sample, result))).join(','));
        }
    }

    return '\uFEFF' + lines.join('\r\n');
}
