import { ResultDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { NRL } from '../../../samples/model/sample.enums';
import { DownloadColumn, buildResultsCsv, downloadColumnsForNrl } from './results-csv';

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

describe('downloadColumnsForNrl', () => {
    const SAMPLE_COLUMN_COUNT = 5; // 3 sample numbers + BfR order number + Erreger

    it('starts with the 5 sample columns then the NRL result columns, in order', () => {
        const columns = downloadColumnsForNrl(NRL.NRL_Salm);
        const resultHeaders = columns.slice(SAMPLE_COLUMN_COUNT).map(column => column.header);

        expect(columns).toHaveLength(SAMPLE_COLUMN_COUNT + 2);
        expect(resultHeaders).toEqual(['Serovar', 'Seroformel']);
    });

    // The file carries the columns the results view shows, in its order and with
    // its headers: the BfR order number in sixth place on screen follows the
    // three sample numbers here, and Erreger is headed as next to the results
    // (tickets #786/#856).
    it('heads the sample columns as the results view does, without soft hyphens', () => {
        const columns = downloadColumnsForNrl(NRL.NRL_Salm);

        expect(columns.slice(0, SAMPLE_COLUMN_COUNT).map(column => column.header)).toEqual([
            'Ihre Probenummer',
            'Probenummer nach AVV Data',
            'AVV DatA-Teilproben-Nr.',
            'BfR-Auftragsnummer',
            'Erreger: Eingesendet als'
        ]);
    });

    it('reads sample-number/pathogen values from sampleData and result values from the result', () => {
        const columns = downloadColumnsForNrl(NRL.NRL_Salm);
        const sampleRow = sample(
            { sample_id: 'S1', sample_id_avv: 'S2', partial_sample_id: 'S3', pathogen_avv: 'Salmonella' },
            [result(1, { Serovar: 'S. Typhimurium' })]
        );
        const resultRow = sampleRow.results[0];

        expect(columns[0].getValue(sampleRow, resultRow)).toBe('S1');
        expect(columns[4].getValue(sampleRow, resultRow)).toBe('Salmonella');
        expect(columns.find(column => column.header === 'Serovar')?.getValue(sampleRow, resultRow))
            .toBe('S. Typhimurium');
    });

    // The BfR order number is one per sample, so each of a multi-result sample's
    // rows repeats the value the results view shows for that sample (#856).
    it('reads the BfR order number from the sample, repeating it across its result rows', () => {
        const bfrColumn = downloadColumnsForNrl(NRL.NRL_Salm)[3];
        const sampleRow = sample({}, [
            result(2, { 'BfR-Auftragsnummer': '2026-0815' }),
            result(1, { 'BfR-Auftragsnummer': '2026-0815' })
        ]);

        expect(sampleRow.results.map(resultRow => bfrColumn.getValue(sampleRow, resultRow)))
            .toEqual(['2026-0815', '2026-0815']);
        const noResult: ResultDTO | undefined = undefined;
        expect(bfrColumn.getValue(sample({}, []), noResult)).toBe('');
    });
});
