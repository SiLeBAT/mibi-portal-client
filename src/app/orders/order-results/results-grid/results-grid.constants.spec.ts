import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { dataGridRowHeaderTrack } from '../../../grid/data-grid/data-grid.constants';
import { SamplesGridCellType } from '../../../grid/samples-grid/samples-grid.model';
import { samplesEditorDataHeaders } from '../../../samples/samples-editor/constants/column-headers.constants';
import {
    createFullDataGridModel,
    createResultsGridModel,
    gridColumnTemplate
} from './results-grid.constants';

const FIXED_COLUMN_COUNT = 9; // row-number + NRL + 7 uploaded columns
const sample = {} as SampleWithResultsDTO;
const ALL_DATA_COLUMN_COUNT = Object.keys(samplesEditorDataHeaders).length;

describe('createResultsGridModel', () => {
    it('is the 9 fixed columns, then the toggle bar, then the result columns', () => {
        const model = createResultsGridModel(['Serovar', 'Seroformel']);

        expect(model.columns).toHaveLength(FIXED_COLUMN_COUNT + 1 + 2);
        expect(model.headerRowId).toBe(0);
        expect(model.headerCellType).toBe(SamplesGridCellType.TEXT);
        expect(model.getSampleRowId(3)).toBe(4);
        // The Erreger (pathogen) column keeps the samples-editor header.
        expect(model.columns[5].headerText).toBe(samplesEditorDataHeaders.pathogen_avv);
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
