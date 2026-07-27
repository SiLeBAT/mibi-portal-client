import { ResultDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { DownloadColumn, buildResultsCsv, downloadColumnsForPathogen } from './results-csv';

const result = (position: number, resultData: Record<string, string>): ResultDTO => ({
    id: `r${position}`,
    position: position,
    resultData: resultData
});

const sample = (
    data: Record<string, string>,
    results: ResultDTO[]
): SampleWithResultsDTO => {
    const sampleData: Record<string, { value: string }> = {};
    for (const key of Object.keys(data)) {
        sampleData[key] = { value: data[key] };
    }
    return {
        id: 's1',
        position: 1,
        sampleData: sampleData,
        sampleMeta: {},
        results: results
    } as unknown as SampleWithResultsDTO;
};

const BOM = '\uFEFF';

describe('buildResultsCsv', () => {
    const idColumn: DownloadColumn = { header: 'Id', getValue: sampleRow => sampleRow.id };
    const serovarColumn: DownloadColumn = {
        header: 'Serovar',
        getValue: (_sampleRow, resultRow) => resultRow?.resultData['Serovar'] ?? ''
    };

    it('starts with a UTF-8 BOM and a quoted header row', () => {
        const csv = buildResultsCsv([idColumn, serovarColumn], []);
        expect(csv.startsWith(BOM)).toBe(true);
        expect(csv.slice(BOM.length)).toBe('"Id","Serovar"');
    });

    it('emits one CRLF-separated row per result, ordered by position, repeating sample columns', () => {
        const samples = [sample({}, [result(2, { Serovar: 'B' }), result(1, { Serovar: 'A' })])];

        const rows = buildResultsCsv([idColumn, serovarColumn], samples).slice(BOM.length).split('\r\n');

        expect(rows).toEqual([
            '"Id","Serovar"',
            '"s1","A"',
            '"s1","B"'
        ]);
    });

    it('still emits a single row for a sample without results', () => {
        const rows = buildResultsCsv([idColumn, serovarColumn], [sample({}, [])]).slice(BOM.length).split('\r\n');
        expect(rows).toEqual(['"Id","Serovar"', '"s1",""']);
    });

    it('quotes every value and escapes embedded quotes, keeping commas and newlines inside the quotes', () => {
        const column: DownloadColumn = { header: 'V', getValue: () => 'a,"b\nc' };
        const csv = buildResultsCsv([column], [sample({}, [result(1, {})])]);
        expect(csv.slice(BOM.length)).toBe('"V"\r\n"a,""b\nc"');
    });

    it('preserves comma decimals unchanged', () => {
        const column: DownloadColumn = { header: 'CIP', getValue: (_s, r) => r?.resultData['CIP'] ?? '' };
        const csv = buildResultsCsv([column], [sample({}, [result(1, { CIP: '0,015' })])]);
        expect(csv.slice(BOM.length)).toBe('"CIP"\r\n"0,015"');
    });
});

describe('downloadColumnsForPathogen', () => {
    it('starts with the 4 uploaded columns then the pathogen result columns, in order', () => {
        const columns = downloadColumnsForPathogen('salmonella');
        const resultHeaders = columns.slice(4).map(column => column.header);

        expect(columns).toHaveLength(6);
        expect(resultHeaders).toEqual(['Serovar', 'Seroformel']);
    });

    it('strips soft hyphens from the uploaded-column headers', () => {
        const columns = downloadColumnsForPathogen('salmonella');
        columns.slice(0, 4).forEach(column => expect(column.header).not.toContain('\u00AD'));
    });

    it('reads sample-number/pathogen values from sampleData and result values from the result', () => {
        const columns = downloadColumnsForPathogen('salmonella');
        const sampleRow = sample(
            { sample_id: 'S1', sample_id_avv: 'S2', partial_sample_id: 'S3', pathogen_avv: 'Salmonella' },
            [result(1, { Serovar: 'S. Typhimurium' })]
        );
        const resultRow = sampleRow.results[0];

        expect(columns[0].getValue(sampleRow, resultRow)).toBe('S1');
        expect(columns[3].getValue(sampleRow, resultRow)).toBe('Salmonella');
        expect(columns.find(column => column.header === 'Serovar')?.getValue(sampleRow, resultRow))
            .toBe('S. Typhimurium');
    });
});
