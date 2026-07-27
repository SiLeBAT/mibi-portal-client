import { ResultDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { SampleProperty } from '../../../samples/model/sample-management.model';
import { samplesEditorDataHeaders } from '../../../samples/samples-editor/constants/column-headers.constants';
import { getResultColumnKeys } from '../results-grid/pathogen-catalog';
import { orderedResults } from '../results-grid/results-grid.constants';

export interface DownloadColumn {
    header: string;
    getValue(sample: SampleWithResultsDTO, result: ResultDTO | undefined): string;
}

// The 3 sample-number columns + the pathogen (Erreger) column from the uploaded
// data, in the same order as the results view (ticket #786).
const SAMPLE_COLUMN_SELECTORS: SampleProperty[] = [
    'sample_id',
    'sample_id_avv',
    'partial_sample_id',
    'pathogen_avv'
];

function stripSoftHyphens(text: string): string {
    return text.replace(/\u00AD/g, '');
}

function sampleColumn(selector: SampleProperty): DownloadColumn {
    return {
        header: stripSoftHyphens(samplesEditorDataHeaders[selector]),
        getValue: sample => sample.sampleData[selector]?.value ?? ''
    };
}

function resultDownloadColumn(key: string): DownloadColumn {
    return {
        header: key,
        getValue: (_sample, result) => result?.resultData[key] ?? ''
    };
}

/**
 * CSV columns for a pathogen: the sample-number + pathogen columns, then that
 * pathogen's result columns — matching the on-screen results order.
 */
export function downloadColumnsForPathogen(pathogenId: string): DownloadColumn[] {
    return [
        ...SAMPLE_COLUMN_SELECTORS.map(selector => sampleColumn(selector)),
        ...getResultColumnKeys(pathogenId).map(key => resultDownloadColumn(key))
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
