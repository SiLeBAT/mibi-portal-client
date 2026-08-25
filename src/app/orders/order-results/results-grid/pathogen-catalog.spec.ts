import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { NRL } from '../../../samples/model/sample.enums';
import {
    derivePathogenTabs,
    filterSamplesByPathogen,
    getResultColumnKeys
} from './pathogen-catalog';

const sample = (nrl: string, erreger: string = ''): SampleWithResultsDTO =>
    ({
        sampleData: { pathogen_avv: { value: erreger } },
        sampleMeta: { nrl: nrl },
        results: []
    }) as unknown as SampleWithResultsDTO;

describe('derivePathogenTabs', () => {
    it('resolves the catalog pathogens by NRL, with their tab + file tokens', () => {
        const tabs = derivePathogenTabs([
            sample(NRL.NRL_AR, 'Escherichia coli'),
            sample(NRL.NRL_Salm, 'Salmonella Brandenburg')
        ]);

        expect(tabs).toEqual([
            { id: 'NRL-AR', fullName: 'Escherichia coli', abbreviation: 'E. coli', fileToken: 'Ecoli' },
            { id: 'NRL-Salm', fullName: 'Salmonella', abbreviation: 'Salm', fileToken: 'Salmonella' }
        ]);
    });

    // The reason the tabs are keyed on the NRL at all (ticket #827): matching the
    // Erreger text by prefix merged the VTEC sample into the E. coli tab.
    it('keeps VTEC apart from E. coli although both are an "Escherichia coli" Erreger', () => {
        const tabs = derivePathogenTabs([
            sample(NRL.NRL_AR, 'Escherichia coli'),
            sample(NRL.NRL_VTEC, 'Escherichia coli O157')
        ]);

        expect(tabs).toEqual([
            { id: 'NRL-AR', fullName: 'Escherichia coli', abbreviation: 'E. coli', fileToken: 'Ecoli' },
            {
                id: 'NRL-VTEC',
                fullName: 'Pathogene Escherichia coli',
                abbreviation: 'VTEC',
                fileToken: 'VTEC'
            }
        ]);
    });

    it('returns one distinct tab per pathogen, sorted alphabetically by abbreviation', () => {
        const tabs = derivePathogenTabs([
            sample(NRL.NRL_Salm),
            sample(NRL.NRL_AR),
            sample(NRL.NRL_Salm)
        ]);

        expect(tabs.map(tab => tab.id)).toEqual(['NRL-AR', 'NRL-Salm']);
    });

    // The abbreviations and their order as specified in ticket #827.
    it('abbreviates every known pathogen, ordered as in the catalogue table', () => {
        const tabs = derivePathogenTabs([
            sample(NRL.KL_Yersinia),
            sample(NRL.NRL_VTEC),
            sample(NRL.KL_Vibrio),
            sample(NRL.NRL_Staph),
            sample(NRL.NRL_Salm),
            sample(NRL.NRL_Listeria),
            sample(NRL.NRL_AR_Kleb),
            sample(NRL.NRL_AR),
            sample(NRL.L_Clostridium),
            sample(NRL.NRL_Campy),
            sample(NRL.L_Bacillus)
        ]);

        expect(tabs.map(tab => tab.abbreviation)).toEqual([
            'Bacillus', 'Campy', 'Clost', 'E. coli', 'Kleb', 'List', 'Salm', 'Staph', 'Vibrio', 'VTEC', 'Yers'
        ]);
        expect(tabs.map(tab => tab.fullName)).toEqual([
            'Bacillus',
            'Campylobacter',
            'Clostridium',
            'Escherichia coli',
            'Klebsiella',
            'Listeria monocytogenes',
            'Salmonella',
            'Staphylococcus aureus',
            'Vibrio',
            'Pathogene Escherichia coli',
            'Yersinia'
        ]);
    });

    it('gives a sample without a recognized laboratory a fallback tab from its Erreger value', () => {
        const [tab] = derivePathogenTabs([sample(NRL.UNKNOWN, 'Aeromonas spp.')]);

        expect(tab).toEqual({
            id: 'other:aeromonas spp.',
            fullName: 'Aeromonas spp.',
            abbreviation: 'Aeromonas spp.',
            fileToken: 'Aeromonasspp'
        });
    });

    it('falls back to "Unbekannt" when neither laboratory nor Erreger value is known', () => {
        const [tab] = derivePathogenTabs([sample('', '')]);

        expect(tab.id).toBe('other:unbekannt');
        expect(tab.fileToken).toBe('Unbekannt');
    });
});

describe('filterSamplesByPathogen', () => {
    it('keeps only the given pathogen\'s samples, preserving order', () => {
        const ecoli1 = sample(NRL.NRL_AR);
        const salm = sample(NRL.NRL_Salm);
        const ecoli2 = sample(NRL.NRL_AR);

        expect(filterSamplesByPathogen([ecoli1, salm, ecoli2], 'NRL-AR')).toEqual([ecoli1, ecoli2]);
        expect(filterSamplesByPathogen([ecoli1, salm, ecoli2], 'NRL-Salm')).toEqual([salm]);
    });
});

describe('getResultColumnKeys', () => {
    it('returns the catalog result keys for a known pathogen', () => {
        expect(getResultColumnKeys('NRL-Salm')).toEqual(['Serovar', 'Seroformel']);
        expect(getResultColumnKeys('NRL-AR')).toContain('CIP');
        expect(getResultColumnKeys('NRL-AR')).toHaveLength(13);
    });

    // The remaining pathogen column sets are not specified yet (ticket #827).
    it('returns no keys for a pathogen without a known result set', () => {
        expect(getResultColumnKeys('NRL-VTEC')).toEqual([]);
        expect(getResultColumnKeys('KL-Vibrio')).toEqual([]);
    });

    it('returns no keys for an unknown pathogen', () => {
        expect(getResultColumnKeys('other:aeromonas spp.')).toEqual([]);
    });
});
