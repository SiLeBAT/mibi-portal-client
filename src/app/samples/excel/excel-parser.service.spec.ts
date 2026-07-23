import { utils, write, WorkBook } from 'xlsx';
import { ExcelParserService } from './excel-parser.service';
import { FORM_PROPERTIES } from './excel-parser.constants';
import { ParsedAnalysisOption, ParsedUrgency } from './excel-parser.model';

// jsdom's File does not implement arrayBuffer(), so use a light stub exposing just
// the members the parser reads (`name` and `arrayBuffer()`).
function fileFromWorkbook(wb: WorkBook, name: string): File {
    const out: ArrayBuffer = write(wb, { type: 'array', bookType: 'xlsx' });
    const arrayBuffer = async (): Promise<ArrayBuffer> => {
        await Promise.resolve();
        return out;
    };
    return { name: name, arrayBuffer: arrayBuffer } as unknown as File;
}

// Excel cell address (e.g. 'C22') -> [rowIndex, colIndex] for a 2D grid.
function cellToRowCol(address: string): [number, number] {
    const decoded = utils.decode_cell(address);
    return [decoded.r, decoded.c];
}

// Build a minimal but structurally-valid Einsendeformular sheet.
function buildSampleSheetFile(): File {
    const rows = 45;
    const cols = 26;
    const grid: (string | undefined)[][] = Array.from({ length: rows }, () =>
        Array.from<string | undefined>({ length: cols })
    );
    const set = (address: string, value: string) => {
        const [r, c] = cellToRowCol(address);
        grid[r][c] = value;
    };

    set('B3', 'V18'); // version -> '18' after stripping leading char
    set('B7', 'NRL-VTEC'); // raw NRL string (validated server-side)
    set('L27', 'normal'); // urgency -> NORMAL
    set('C12', 'Test Institute'); // sender institute
    set('C22', 'lab@example.com'); // sender email
    set('P12', 'x'); // species analysis -> ACTIVE
    set('A27', '01.02.2020'); // signature date
    set('R6', 'REF-123'); // customer ref number

    // Sample data header marker at the default header row (A41), data below it.
    set('A41', 'Ihre Probe-nummer');
    set('A42', 'sample-0001'); // sample_id
    set('D42', 'Salmonella'); // pathogen_avv (4th column)

    const ws = utils.aoa_to_sheet(grid);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Einsendeformular');
    return fileFromWorkbook(wb, 'einsendebogen.xlsx');
}

function buildForeignWorkbookFile(): File {
    const ws = utils.aoa_to_sheet([['hello']]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'NotTheForm');
    return fileFromWorkbook(wb, 'foreign.xlsx');
}

describe('ExcelParserService', () => {
    let service: ExcelParserService;

    beforeEach(() => {
        service = new ExcelParserService();
    });

    it('parses a valid Einsendeformular into the ParsedSampleSheet shape', async () => {
        const result = await service.parse(buildSampleSheetFile());

        expect(result.samples.length).toBe(1);
        expect(result.meta.fileName).toBe('einsendebogen.xlsx');
        expect(result.meta.version).toBe('18');
        expect(result.meta.nrl).toBe('NRL-VTEC');
        expect(result.meta.urgency).toBe(ParsedUrgency.NORMAL);
        expect(result.meta.customerRefNumber).toBe('REF-123');
        expect(result.meta.sender.email).toBe('lab@example.com');
        expect(result.meta.sender.instituteName).toBe('Test Institute');
        expect(result.meta.analysis.species).toBe(ParsedAnalysisOption.ACTIVE);
        expect(result.meta.analysis.resistance).toBe(ParsedAnalysisOption.OMIT);
    });

    it('reads sample data values and annotates every field', async () => {
        const result = await service.parse(buildSampleSheetFile());

        const sample = result.samples[0];
        expect(sample.data['sample_id'].value).toBe('sample-0001');
        expect(sample.data['pathogen_avv'].value).toBe('Salmonella');

        for (const prop of FORM_PROPERTIES) {
            expect(sample.data[prop]).toEqual(
                expect.objectContaining({
                    value: expect.any(String),
                    errors: [],
                    correctionOffer: []
                })
            );
        }
    });

    it('does not assign per-sample NRL/analysis (enriched server-side)', async () => {
        const result = await service.parse(buildSampleSheetFile());
        expect(result.samples[0]).not.toHaveProperty('meta');
    });

    it('rejects a workbook whose first sheet is not the Einsendeformular', async () => {
        await expect(
            service.parse(buildForeignWorkbookFile())
        ).rejects.toThrow(/valid excel sheet/);
    });
});
