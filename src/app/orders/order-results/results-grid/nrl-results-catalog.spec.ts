import { NRLDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { NRL } from '../../../samples/model/sample.enums';
import {
    createNrlMatcher,
    deriveNrlTabs,
    filterSamplesByNrl,
    getResultColumns
} from './nrl-results-catalog';

const sample = (nrl: string, erreger: string = ''): SampleWithResultsDTO =>
    ({
        sampleData: { pathogen_avv: { value: erreger } },
        sampleMeta: { nrl: nrl },
        results: []
    }) as unknown as SampleWithResultsDTO;

const nrlDto = (id: string, selector: string[]): NRLDTO => ({
    id: id,
    selector: selector,
    standardProcedures: [],
    optionalProcedures: []
});

// Selectors as maintained in the NRL table (Dashboard).
const nrls: NRLDTO[] = [
    nrlDto('NRL-VTEC', ['^Escherichia coli O157$', '^Escherichia coli Verotoxinbildende$']),
    nrlDto('NRL-Salm', ['^.*Salmonella.*$']),
    nrlDto('NRL-AR', ['^.*enterococ.*$', '^Escherichia coli$', '^Escherichia coli ESBL-bildend$']),
    nrlDto('KL-Yersinia', ['^.*Yers.*$'])
];
const matcher = createNrlMatcher(nrls);

describe('createNrlMatcher', () => {
    it('resolves an Erreger to the NRL whose selector matches it', () => {
        expect(matcher('Salmonella Brandenburg')).toBe(NRL.NRL_Salm);
        expect(matcher('Enterococcus faecium')).toBe(NRL.NRL_AR);
        expect(matcher('Yersinia enterocolitica')).toBe(NRL.KL_Yersinia);
    });

    // The selectors are the only thing separating these two E. coli Erreger.
    it('keeps VTEC apart from NRL-AR although both are an "Escherichia coli" Erreger', () => {
        expect(matcher('Escherichia coli')).toBe(NRL.NRL_AR);
        expect(matcher('Escherichia coli O157')).toBe(NRL.NRL_VTEC);
    });

    it('matches case-insensitively, like the server', () => {
        expect(matcher('SALMONELLA spp.')).toBe(NRL.NRL_Salm);
    });

    it('lets the first matching NRL in list order win', () => {
        const catchAllFirst = createNrlMatcher([nrlDto('KL-Vibrio', ['^.*$']), ...nrls]);

        expect(catchAllFirst('Salmonella')).toBe(NRL.KL_Vibrio);
    });

    it('returns undefined for an unmatched or empty Erreger', () => {
        expect(matcher('Aeromonas spp.')).toBeUndefined();
        expect(matcher('')).toBeUndefined();
    });

    it('accepts the long laboratory name as NRL id', () => {
        const longNames = createNrlMatcher([nrlDto('NRL für Salmonella', ['^.*Salmonella.*$'])]);

        expect(longNames('Salmonella')).toBe(NRL.NRL_Salm);
    });

    it('skips invalid patterns and NRLs unknown to the client', () => {
        const odd = createNrlMatcher([
            nrlDto('NRL-Trichinella', ['^.*$']),
            nrlDto('NRL-Salm', ['(', '^.*Salmonella.*$'])
        ]);

        expect(odd('Salmonella')).toBe(NRL.NRL_Salm);
        expect(odd('Trichinella spiralis')).toBeUndefined();
    });

    it('matches nothing while the NRL list is not loaded', () => {
        expect(createNrlMatcher([])('Salmonella')).toBeUndefined();
    });
});

describe('deriveNrlTabs', () => {
    it('labels each tab with its NRL id and keeps the former file tokens', () => {
        const tabs = deriveNrlTabs([
            sample(NRL.NRL_AR, 'Escherichia coli'),
            sample(NRL.NRL_Salm, 'Salmonella Brandenburg')
        ], matcher);

        expect(tabs).toEqual([
            { id: 'NRL-AR', label: 'NRL-AR', fileToken: 'Ecoli' },
            { id: 'NRL-Salm', label: 'NRL-Salm', fileToken: 'Salmonella' }
        ]);
    });

    it('assigns by the regex match rather than the NRL stored at upload', () => {
        const [tab] = deriveNrlTabs([sample(NRL.UNKNOWN, 'Salmonella Enteritidis')], matcher);

        expect(tab.id).toBe('NRL-Salm');
    });

    it('falls back to the stored NRL when no selector matches', () => {
        const [tab] = deriveNrlTabs([sample(NRL.NRL_Listeria, 'Listeria monocytogenes')], matcher);

        expect(tab).toEqual({ id: 'NRL-Listeria', label: 'NRL-Listeria', fileToken: 'List' });
    });

    it('returns one distinct tab per NRL, sorted alphabetically by label', () => {
        const tabs = deriveNrlTabs([
            sample('', 'Yersinia enterocolitica'),
            sample('', 'Salmonella'),
            sample('', 'Escherichia coli O157'),
            sample('', 'Salmonella'),
            sample('', 'Escherichia coli')
        ], matcher);

        expect(tabs.map(tab => tab.label)).toEqual(['KL-Yersinia', 'NRL-AR', 'NRL-Salm', 'NRL-VTEC']);
    });

    it('gives a sample without a recognized laboratory a fallback tab from its Erreger value', () => {
        const [tab] = deriveNrlTabs([sample(NRL.UNKNOWN, 'Aeromonas spp.')], matcher);

        expect(tab).toEqual({
            id: 'other:aeromonas spp.',
            label: 'Aeromonas spp.',
            fileToken: 'Aeromonasspp'
        });
    });

    it('falls back to "Unbekannt" when neither laboratory nor Erreger value is known', () => {
        const [tab] = deriveNrlTabs([sample('', '')], matcher);

        expect(tab.id).toBe('other:unbekannt');
        expect(tab.fileToken).toBe('Unbekannt');
    });
});

describe('filterSamplesByNrl', () => {
    it('keeps only the given NRL\'s samples, preserving order', () => {
        const ecoli1 = sample('', 'Escherichia coli');
        const salm = sample('', 'Salmonella');
        const ecoli2 = sample('', 'Escherichia coli ESBL-bildend');

        expect(filterSamplesByNrl([ecoli1, salm, ecoli2], 'NRL-AR', matcher)).toEqual([ecoli1, ecoli2]);
        expect(filterSamplesByNrl([ecoli1, salm, ecoli2], 'NRL-Salm', matcher)).toEqual([salm]);
    });
});

describe('getResultColumns', () => {
    it('returns the result columns of NRL-Salm and NRL-AR', () => {
        expect(getResultColumns('NRL-Salm')).toEqual([
            { key: 'Serovar', header: 'Serovar' },
            { key: 'Seroformel', header: 'Seroformel' }
        ]);
        expect(getResultColumns('NRL-AR')).toHaveLength(13);
        expect(getResultColumns('NRL-AR')).toContainEqual({ key: 'CIP', header: 'CIP' });
    });

    // The remaining column sets are not specified yet (ticket #875).
    it('returns no columns for an NRL without a known result set', () => {
        expect(getResultColumns('NRL-VTEC')).toEqual([]);
        expect(getResultColumns('KL-Vibrio')).toEqual([]);
    });

    it('returns no columns for a fallback tab', () => {
        expect(getResultColumns('other:aeromonas spp.')).toEqual([]);
        expect(getResultColumns(NRL.UNKNOWN)).toEqual([]);
    });
});
