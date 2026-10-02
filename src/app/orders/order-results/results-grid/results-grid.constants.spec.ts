import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { dataGridRowHeaderTrack } from '../../../grid/data-grid/data-grid.constants';
import { SamplesGridCellType } from '../../../grid/samples-grid/samples-grid.model';
import { samplesEditorDataHeaders } from '../../../samples/samples-editor/constants/column-headers.constants';
import {
    createFullDataGridModel,
    createResultsGridModel,
    gridColumnTemplate
} from './results-grid.constants';

const FIXED_COLUMN_COUNT = 10; // row-number + NRL + BfR order number + 7 uploaded columns
const sample = {} as SampleWithResultsDTO;
const ALL_DATA_COLUMN_COUNT = Object.keys(samplesEditorDataHeaders).length;

function sampleWithResults(...resultData: Record<string, string>[]): SampleWithResultsDTO {
    return {
        results: resultData.map((data, index) => ({
            id: `r${index + 1}`,
            position: index + 1,
            resultData: data
        }))
    } as SampleWithResultsDTO;
}

describe('createResultsGridModel', () => {
    it('is the 10 fixed columns, then the toggle bar, then the result columns', () => {
        const model = createResultsGridModel(['Serovar', 'Seroformel']);

        expect(model.columns).toHaveLength(FIXED_COLUMN_COUNT + 1 + 2);
        expect(model.headerRowId).toBe(0);
        expect(model.headerCellType).toBe(SamplesGridCellType.TEXT);
        expect(model.getSampleRowId(3)).toBe(4);
        // Next to the results the Erreger (pathogen) column is headed
        // "Erreger: Eingesendet als" rather than with the AVV catalogue
        // reference used in the samples editor (ticket #856).
        expect(model.columns[6].headerText).toBe('Erreger: Eingesendet als');
    });

    // The BfR order number comes from the LIMS with the results, not from the
    // uploaded order data, and sits in sixth place (ticket #856).
    describe('the BfR order number column', () => {
        const bfrColumn = () => createResultsGridModel([]).columns[5];

        it('is the sixth column, headed "BfR-Auftragsnummer"', () => {
            expect(bfrColumn().headerText).toBe('BfR-Auftrags­nummer');
            expect(bfrColumn().cellType).toBe(SamplesGridCellType.TEXT);
            expect(bfrColumn().fill).toBeUndefined();
        });

        it('reads the BfR-Auftragsnummer property of the sample\'s first result', () => {
            const row = sampleWithResults(
                { 'BfR-Auftragsnummer': '2026-0815' },
                { 'BfR-Auftragsnummer': '2026-0816' }
            );

            expect(bfrColumn().getData(row, 0)).toBe('2026-0815');
        });

        it('is empty for a sample without results or without that property', () => {
            expect(bfrColumn().getData(sampleWithResults(), 0)).toBe('');
            expect(bfrColumn().getData(sampleWithResults({ Serovar: 'Enteritidis' }), 0)).toBe('');
        });
    });

    it('renders the toggle column as a TOGGLE bar labelled "Alle Auftragsdaten anzeigen: Hier klicken"', () => {
        const toggle = createResultsGridModel([]).columns[FIXED_COLUMN_COUNT];

        expect(toggle.cellType).toBe(SamplesGridCellType.TOGGLE);
        expect(toggle.headerCellType).toBe(SamplesGridCellType.TOGGLE);
        expect(toggle.getHeaderData?.()).toBe('Alle Auftragsdaten anzeigen: Hier klicken');
        // Every bar cell repeats the label so the tooltip covers the whole button (#836).
        expect(toggle.getData(sample, 0)).toBe('Alle Auftragsdaten anzeigen: Hier klicken');
    });

    it('renders each result column as a filling STACKED cell headed by its key', () => {
        const model = createResultsGridModel(['Serovar', 'Seroformel']);
        const [serovar, seroformel] = model.columns.slice(FIXED_COLUMN_COUNT + 1);

        expect(serovar).toMatchObject({ cellType: SamplesGridCellType.STACKED, headerText: 'Serovar', fill: true });
        expect(seroformel).toMatchObject({ headerText: 'Seroformel', fill: true });
    });
});

describe('createFullDataGridModel', () => {
    it('is row-number + NRL + all uploaded columns, then the toggle bar last', () => {
        const model = createFullDataGridModel();
        const toggle = model.columns[model.columns.length - 1];

        expect(model.columns).toHaveLength(2 + ALL_DATA_COLUMN_COUNT + 1);
        expect(toggle.cellType).toBe(SamplesGridCellType.TOGGLE);
        expect(toggle.getHeaderData?.()).toBe('BfR-Ergebnisse anzeigen: Hier klicken');
        expect(toggle.getData(sample, 0)).toBe('BfR-Ergebnisse anzeigen: Hier klicken');
    });

    // Showing the uploaded data alone means showing it as it was uploaded: the
    // Erreger column keeps its AVV catalogue reference and the LIMS-supplied BfR
    // order number has no place among the uploaded columns (ticket #856).
    it('keeps the samples-editor Erreger header and omits the BfR order number', () => {
        const headers = createFullDataGridModel().columns.map(column => column.headerText);

        expect(headers).toContain(samplesEditorDataHeaders.pathogen_avv);
        expect(headers).not.toContain('BfR-Auftrags­nummer');
    });
});

// The row-number column is capped to three digits (tickets #827/#841) instead of
// growing with its content like the other uploaded columns. Asserting against the
// shared grid constant keeps it identical to the samples editor's row header.
const ROW_NUMBER_TRACK = dataGridRowHeaderTrack;

describe('gridColumnTemplate', () => {
    it('gives the result columns 1fr, the row number a fixed track and everything else auto', () => {
        const template = gridColumnTemplate(createResultsGridModel(['Serovar', 'Seroformel']));
        const autoColumns = new Array(FIXED_COLUMN_COUNT).fill('auto').join(' ');

        expect(template).toBe(`${ROW_NUMBER_TRACK} ${autoColumns} 1fr 1fr`);
    });

    it('is the row-number track plus all auto for the full-data model (no result columns)', () => {
        const model = createFullDataGridModel();
        const autoColumns = new Array(model.columns.length - 1).fill('auto').join(' ');

        expect(gridColumnTemplate(model)).toBe(`${ROW_NUMBER_TRACK} ${autoColumns}`);
    });
});
