import { SampleWithResultsDTO } from '../../../core/model/response.model';
import {
    derivePathogenTabs,
    filterSamplesByPathogen,
    getResultColumnKeys
} from './pathogen-catalog';

const sample = (erreger: string): SampleWithResultsDTO =>
    ({
        sampleData: { pathogen_avv: { value: erreger } },
        results: []
    }) as unknown as SampleWithResultsDTO;

describe('derivePathogenTabs', () => {
    it('resolves the catalog pathogens by prefix, with their tab + file tokens', () => {
        const tabs = derivePathogenTabs([sample('Escherichia coli'), sample('Salmonella Spp.')]);

        expect(tabs).toEqual([
            { id: 'escherichia-coli', fullName: 'Escherichia coli', abbreviation: 'E. coli', fileToken: 'Ecoli' },
            { id: 'salmonella', fullName: 'Salmonella', abbreviation: 'Salm', fileToken: 'Salmonella' }
        ]);
    });

    it('returns one distinct tab per pathogen, sorted alphabetically by abbreviation', () => {
        const tabs = derivePathogenTabs([
            sample('Salmonella'),
            sample('Escherichia coli'),
            sample('Salmonella')
        ]);

        expect(tabs.map(tab => tab.id)).toEqual(['escherichia-coli', 'salmonella']);
    });

    it('gives an unknown pathogen a fallback tab using its raw value and a sanitized file token', () => {
        const [tab] = derivePathogenTabs([sample('Vibrio spp.')]);

        expect(tab).toEqual({
            id: 'other:vibrio spp.',
            fullName: 'Vibrio spp.',
            abbreviation: 'Vibrio spp.',
            fileToken: 'Vibriospp'
        });
    });

    it('falls back to "Unbekannt" when the Erreger value is empty', () => {
        const [tab] = derivePathogenTabs([sample('')]);

        expect(tab.id).toBe('other:unbekannt');
        expect(tab.fileToken).toBe('Unbekannt');
    });
});

describe('filterSamplesByPathogen', () => {
    it('keeps only the given pathogen\'s samples, preserving order', () => {
        const ecoli1 = sample('Escherichia coli');
        const salm = sample('Salmonella');
        const ecoli2 = sample('Escherichia coli');

        expect(filterSamplesByPathogen([ecoli1, salm, ecoli2], 'escherichia-coli')).toEqual([ecoli1, ecoli2]);
        expect(filterSamplesByPathogen([ecoli1, salm, ecoli2], 'salmonella')).toEqual([salm]);
    });
});

describe('getResultColumnKeys', () => {
    it('returns the catalog result keys for a known pathogen', () => {
        expect(getResultColumnKeys('salmonella')).toEqual(['Serovar', 'Seroformel']);
        expect(getResultColumnKeys('escherichia-coli')).toContain('CIP');
        expect(getResultColumnKeys('escherichia-coli')).toHaveLength(13);
    });

    it('returns no keys for an unknown pathogen', () => {
        expect(getResultColumnKeys('other:vibrio spp.')).toEqual([]);
    });
});
