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

type CellValue = string | Date;

// Address of a sample-data column in the first data row (row 42).
function sampleCell(property: string): string {
    return utils.encode_cell({ r: 41, c: FORM_PROPERTIES.indexOf(property) });
}

// Build a minimal but structurally-valid Einsendeformular sheet. `overrides`
// sets further cells by address, e.g. a date cell holding a real Date.
function buildSampleSheetFile(overrides: Record<string, CellValue> = {}): File {
    const rows = 45;
    const cols = 26;
    const grid: (CellValue | undefined)[][] = Array.from(
        { length: rows },
        () => Array.from<CellValue | undefined>({ length: cols })
    );
    const set = (address: string, value: CellValue) => {
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

    Object.entries(overrides).forEach(([address, value]) =>
        set(address, value)
    );

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

// ---------------------------------------------------------------------------
// Date cells: the day Excel shows, in every timezone
// ---------------------------------------------------------------------------

describe('ExcelParserService date cells', () => {
    let service: ExcelParserService;

    beforeEach(() => {
        service = new ExcelParserService();
    });

    const samplingDateOf = async (value: CellValue): Promise<string> => {
        const result = await service.parse(
            buildSampleSheetFile({ [sampleCell('sampling_date')]: value })
        );
        return result.samples[0].data['sampling_date'].value;
    };

    const signatureDateOf = async (value: CellValue): Promise<string> => {
        const result = await service.parse(buildSampleSheetFile({ A27: value }));
        return result.meta.signatureDate;
    };

    it('reads a date cell in winter time', async () => {
        expect(await samplingDateOf(new Date(2026, 0, 15))).toBe('15.01.2026');
    });

    it('reads a date cell in summer time', async () => {
        expect(await samplingDateOf(new Date(2026, 6, 15))).toBe('15.07.2026');
    });

    it('reads a date cell that also carries a time', async () => {
        expect(await samplingDateOf(new Date(2026, 6, 15, 14, 30))).toBe(
            '15.07.2026'
        );
    });

    it('does not depend on how the browser writes Date.toString()', async () => {
        const toString = Date.prototype.toString;
        // eslint-disable-next-line no-extend-native
        Date.prototype.toString = function () {
            return 'Mittwoch, 15. Juli 2026';
        };

        try {
            expect(await samplingDateOf(new Date(2026, 6, 15))).toBe(
                '15.07.2026'
            );
        } finally {
            // eslint-disable-next-line no-extend-native
            Date.prototype.toString = toString;
        }
    });

    it('reads a date written as German text', async () => {
        expect(await samplingDateOf('5.6.2026')).toBe('05.06.2026');
    });

    it('reads a date written in the American order', async () => {
        expect(await samplingDateOf('06/05/2026')).toBe('05.06.2026');
    });

    it('keeps a value it cannot read as a date', async () => {
        expect(await samplingDateOf('not a date')).toBe('not a date');
    });

    it('writes a meta date cell as a German date', async () => {
        expect(await signatureDateOf(new Date(2026, 6, 15))).toBe('15.07.2026');
    });

    it('writes a meta date cell carrying a time with that time', async () => {
        expect(await signatureDateOf(new Date(2026, 6, 15, 14, 30, 5))).toBe(
            '15.07.2026 14:30:05'
        );
    });
});
