import { SamplesGridCellType } from '../../../grid/samples-grid/samples-grid.model';
import { samplesEditorDataHeaders } from '../../../samples/samples-editor/constants/column-headers.constants';
import {
    createFullDataGridModel,
    createResultsGridModel,
    gridColumnTemplate
} from './results-grid.constants';

const FIXED_COLUMN_COUNT = 9; // row-number + NRL + 7 uploaded columns
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

    it('renders the toggle column as a TOGGLE bar labelled "Alle Auftragsdaten anzeigen"', () => {
        const toggle = createResultsGridModel([]).columns[FIXED_COLUMN_COUNT];

        expect(toggle.cellType).toBe(SamplesGridCellType.TOGGLE);
        expect(toggle.headerCellType).toBe(SamplesGridCellType.TOGGLE);
        expect(toggle.getHeaderData?.()).toBe('Alle Auftragsdaten anzeigen');
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
        expect(toggle.getHeaderData?.()).toBe('BfR-Ergebnisse anzeigen');
    });
});

describe('gridColumnTemplate', () => {
    it('gives the result columns 1fr and everything else auto', () => {
        const template = gridColumnTemplate(createResultsGridModel(['Serovar', 'Seroformel']));
        expect(template).toBe(`${new Array(FIXED_COLUMN_COUNT + 1).fill('auto').join(' ')} 1fr 1fr`);
    });

    it('is all auto for the full-data model (no result columns)', () => {
        const model = createFullDataGridModel();
        expect(gridColumnTemplate(model)).toBe(new Array(model.columns.length).fill('auto').join(' '));
    });
});
