import { NRLDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { NRL } from '../../../samples/model/sample.enums';
import { required } from '../../../shared/model/invariant';
import {
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

describe('deriveNrlTabs', () => {
    it('labels each tab and names its download file after the NRL (#886)', () => {
        const tabs = deriveNrlTabs([
            sample(NRL.NRL_AR, 'Escherichia coli'),
            sample(NRL.NRL_Salm, 'Salmonella Brandenburg')
        ]);

        expect(tabs).toEqual([
            { id: 'NRL-AR', label: 'NRL-AR', fileToken: 'NRL-AR' },
            { id: 'NRL-Salm', label: 'NRL-Salm', fileToken: 'NRL-Salm' }
        ]);
    });

    // The server assigned the NRL at upload; the Erreger is not evaluated again.
    it('assigns by the NRL stored at upload, whatever the Erreger says', () => {
        const tab = required(deriveNrlTabs([sample(NRL.NRL_VTEC, 'Escherichia coli')])[0], 'tab');

        expect(tab.id).toBe('NRL-VTEC');
    });

    it('accepts the long laboratory name as stored NRL', () => {
        const [tab] = deriveNrlTabs([sample('NRL für Salmonella', 'Salmonella')]);

        expect(tab).toEqual({ id: 'NRL-Salm', label: 'NRL-Salm', fileToken: 'NRL-Salm' });
    });

    it('shows NRL-AR-Kleb samples on the NRL-AR tab instead of a tab of their own', () => {
        expect(deriveNrlTabs([sample(NRL.NRL_AR_Kleb, 'Klebsiella pneumoniae')])).toEqual([
            { id: 'NRL-AR', label: 'NRL-AR', fileToken: 'NRL-AR' }
        ]);
        expect(deriveNrlTabs([
            sample(NRL.NRL_AR_Kleb, 'Klebsiella pneumoniae'),
            sample(NRL.NRL_AR, 'Escherichia coli')
        ]).map(tab => tab.id)).toEqual(['NRL-AR']);
    });

    it('returns one distinct tab per NRL, sorted alphabetically by label', () => {
        const tabs = deriveNrlTabs([
            sample(NRL.KL_Yersinia, 'Yersinia enterocolitica'),
            sample(NRL.NRL_Salm, 'Salmonella'),
            sample(NRL.NRL_VTEC, 'Escherichia coli O157'),
            sample(NRL.NRL_Salm, 'Salmonella'),
            sample(NRL.NRL_AR, 'Escherichia coli')
        ]);

        expect(tabs.map(tab => tab.label)).toEqual(['KL-Yersinia', 'NRL-AR', 'NRL-Salm', 'NRL-VTEC']);
    });

    it('gives a sample without a recognized laboratory a fallback tab from its Erreger value', () => {
        const [tab] = deriveNrlTabs([sample(NRL.UNKNOWN, 'Aeromonas spp.')]);

        expect(tab).toEqual({
            id: 'other:aeromonas spp.',
            label: 'Aeromonas spp.',
            fileToken: 'Aeromonasspp'
        });
    });

    it('falls back to "Unbekannt" when neither laboratory nor Erreger value is known', () => {
        const tab = required(deriveNrlTabs([sample('', '')])[0], 'tab');

        expect(tab.id).toBe('other:unbekannt');
        expect(tab.fileToken).toBe('Unbekannt');
    });

    describe('tooltip info from the NRL store (#885)', () => {
        const nrl = (id: string, fullName?: string, pathogen?: string): NRLDTO =>
            ({ id: id, full_name: fullName, pathogen: pathogen }) as unknown as NRLDTO;

        it('attaches the full name and pathogen texts of the matching NRL', () => {
            const [tab] = deriveNrlTabs(
                [sample(NRL.NRL_AR, 'Escherichia coli')],
                [nrl('NRL-Salm', 'NRL für Salmonellen'), nrl('NRL-AR', ' NRL für Antibiotikaresistenz ', 'Erreger: Enterokokken')]
            );

            expect(tab?.info).toEqual({ fullName: 'NRL für Antibiotikaresistenz', pathogen: 'Erreger: Enterokokken' });
        });

        it('keeps a single text and leaves the missing one empty', () => {
            const [tab] = deriveNrlTabs([sample(NRL.NRL_AR)], [nrl('NRL-AR', 'NRL für Antibiotikaresistenz')]);

            expect(tab?.info).toEqual({ fullName: 'NRL für Antibiotikaresistenz', pathogen: '' });
        });

        it('sets no info when the NRL has no texts or is not in the store', () => {
            const tabs = deriveNrlTabs([sample(NRL.NRL_AR), sample(NRL.NRL_Salm)], [nrl('NRL-AR', ' ', '')]);

            expect(tabs.map(tab => tab.info)).toEqual([undefined, undefined]);
        });

        it('gives an NRL-AR tab with only NRL-AR-Kleb samples the NRL-AR texts', () => {
            const [tab] = deriveNrlTabs(
                [sample(NRL.NRL_AR_Kleb)],
                [nrl('NRL-AR', 'NRL für Antibiotikaresistenz', 'Erreger: Enterokokken')]
            );

            expect(tab?.info).toEqual({ fullName: 'NRL für Antibiotikaresistenz', pathogen: 'Erreger: Enterokokken' });
        });

        it('sets no info on a fallback tab', () => {
            const [tab] = deriveNrlTabs([sample(NRL.UNKNOWN, 'Aeromonas spp.')], [nrl('other:aeromonas spp.', 'x', 'y')]);

            expect(tab?.info).toBeUndefined();
        });
    });
});

describe('filterSamplesByNrl', () => {
    it('keeps only the given NRL\'s samples, preserving order', () => {
        const ecoli1 = sample(NRL.NRL_AR, 'Escherichia coli');
        const salm = sample(NRL.NRL_Salm, 'Salmonella');
        const ecoli2 = sample(NRL.NRL_AR, 'Escherichia coli ESBL-bildend');

        expect(filterSamplesByNrl([ecoli1, salm, ecoli2], 'NRL-AR')).toEqual([ecoli1, ecoli2]);
        expect(filterSamplesByNrl([ecoli1, salm, ecoli2], 'NRL-Salm')).toEqual([salm]);
    });

    it('includes the NRL-AR-Kleb samples in the NRL-AR tab, preserving order', () => {
        const ecoli = sample(NRL.NRL_AR, 'Escherichia coli');
        const kleb = sample(NRL.NRL_AR_Kleb, 'Klebsiella pneumoniae');
        const salm = sample(NRL.NRL_Salm, 'Salmonella');

        expect(filterSamplesByNrl([kleb, salm, ecoli], 'NRL-AR')).toEqual([kleb, ecoli]);
        expect(filterSamplesByNrl([kleb, salm, ecoli], 'NRL-AR-Kleb')).toEqual([]);
    });
});

describe('getResultColumns', () => {
    // Column count, first and last key per NRL as specified in ticket #876.
    const specifiedSets: [NRL, number, string, string][] = [
        [NRL.NRL_VTEC, 9, 'ehxA-Gen', 'Bemerkung'],
        [NRL.KL_Vibrio, 6, 'VptoxR (297bp)', 'Befund'],
        [NRL.NRL_AR, 5, 'Wachstum MC+1FOT', 'Bemerkung'],
        [NRL.NRL_AR_Kleb, 5, 'Wachstum MC+1FOT', 'Bemerkung'],
        [NRL.NRL_Staph, 43, 'CHROMagar MRSA Koloniemorphologie', 'Bemerkung'],
        [NRL.L_Bacillus, 12, 'Phänotypie', 'Bemerkung'],
        [NRL.L_Clostridium, 12, 'Phänotypie', 'iap-Gen'],
        [NRL.KL_Yersinia, 9, 'Gattung', 'O:9 (837bp)'],
        [NRL.NRL_Salm, 2, 'Serovar', 'Seroformel']
    ];

    it.each(specifiedSets)('returns the %s result columns in display order', (nrl, count, firstKey, lastKey) => {
        const columns = getResultColumns(nrl);

        expect(columns).toHaveLength(count);
        expect(required(columns[0], 'first column').key).toBe(firstKey);
        expect(required(columns[count - 1], 'last column').key).toBe(lastKey);
    });

    // A resultData property exists only once per result, so a repeated key
    // would show the same value in two columns.
    it.each(specifiedSets)('uses every key only once for %s', nrl => {
        const keys = getResultColumns(nrl).map(column => column.key);

        expect(new Set(keys).size).toBe(keys.length);
    });

    it('heads each column with its resultData key', () => {
        expect(getResultColumns('NRL-Salm')).toEqual([
            { key: 'Serovar', header: 'Serovar' },
            { key: 'Seroformel', header: 'Seroformel' }
        ]);
        expect(getResultColumns('KL-Vibrio')).toContainEqual({ key: 'tdh (425bp)', header: 'tdh (425bp)' });
    });

    it('gives NRL-AR-Kleb the same columns as NRL-AR', () => {
        expect(getResultColumns('NRL-AR-Kleb')).toEqual(getResultColumns('NRL-AR'));
    });

    // These column sets are not specified yet (ticket #876).
    it('returns no columns for an NRL without a known result set', () => {
        expect(getResultColumns('NRL-Campy')).toEqual([]);
        expect(getResultColumns('NRL-Listeria')).toEqual([]);
    });

    it('returns no columns for a fallback tab', () => {
        expect(getResultColumns('other:aeromonas spp.')).toEqual([]);
        expect(getResultColumns(NRL.UNKNOWN)).toEqual([]);
    });
});
