import { SampleWithResultsDTO } from '../../../core/model/response.model';

/** A pathogen tab as shown in the results view secondary bar (mockup #3). */
export interface PathogenTab {
    id: string;
    fullName: string;
    abbreviation: string;
    // Filename-safe token used in the CSV download names (ticket #786), e.g.
    // "Ecoli", "Salmonella".
    fileToken: string;
}

interface PathogenCatalogEntry extends PathogenTab {
    matches(erreger: string): boolean;
    resultColumnKeys: string[];
}

// Result column sets per pathogen. Header text = the resultData property name
// for now (a property-name -> label mapping will be added later, see #756).
const ESCHERICHIA_COLI_RESULT_KEYS: string[] = [
    'Citrat', 'H2S', 'Indol', 'Lactose', 'O-AG', 'e-hly', 'eae', 'stx1', 'stx2', 'CHL', 'CIP', 'COL', 'GEN'
];
const SALMONELLA_RESULT_KEYS: string[] = ['Serovar', 'Seroformel'];

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

// The two pathogens present in the current data. Matching is prefix-based on the
// Erreger (AVV-Kat-324) value so e.g. "Salmonella Spp." still maps to Salmonella.
// Further pathogens + their column sets are added here as they appear.
const pathogenCatalog: PathogenCatalogEntry[] = [
    {
        id: 'escherichia-coli',
        fullName: 'Escherichia coli',
        abbreviation: 'E. coli',
        fileToken: 'Ecoli',
        matches: erreger => normalize(erreger).startsWith('escherichia coli'),
        resultColumnKeys: ESCHERICHIA_COLI_RESULT_KEYS
    },
    {
        id: 'salmonella',
        fullName: 'Salmonella',
        abbreviation: 'Salm',
        fileToken: 'Salmonella',
        matches: erreger => normalize(erreger).startsWith('salmonella'),
        resultColumnKeys: SALMONELLA_RESULT_KEYS
    }
];

function erregerOf(sample: SampleWithResultsDTO): string {
    return sample.sampleData.pathogen_avv?.value ?? '';
}

// Resolves the pathogen for a sample. Unknown pathogens still get a tab (using
// their raw Erreger value) so no data is hidden; they carry no result columns yet.
function resolvePathogen(sample: SampleWithResultsDTO): PathogenCatalogEntry {
    const erreger = erregerOf(sample);
    const match = pathogenCatalog.find(entry => entry.matches(erreger));
    if (match) {
        return match;
    }
    const label = erreger || 'Unbekannt';
    return {
        id: 'other:' + normalize(label),
        fullName: label,
        abbreviation: label,
        // Filename-safe fallback token: drop spaces and dots (e.g. "E. coli").
        fileToken: label.replace(/[\s.]+/g, '') || 'Unbekannt',
        matches: () => false,
        resultColumnKeys: []
    };
}

/** Distinct pathogens present in the order, sorted alphabetically by abbreviation. */
export function derivePathogenTabs(samples: SampleWithResultsDTO[]): PathogenTab[] {
    const byId = new Map<string, PathogenTab>();
    samples.forEach(sample => {
        const pathogen = resolvePathogen(sample);
        if (!byId.has(pathogen.id)) {
            byId.set(pathogen.id, {
                id: pathogen.id,
                fullName: pathogen.fullName,
                abbreviation: pathogen.abbreviation,
                fileToken: pathogen.fileToken
            });
        }
    });
    return [...byId.values()].sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
}

/** Samples belonging to the given pathogen tab, preserving order. */
export function filterSamplesByPathogen(
    samples: SampleWithResultsDTO[],
    pathogenId: string
): SampleWithResultsDTO[] {
    return samples.filter(sample => resolvePathogen(sample).id === pathogenId);
}

/** The result column keys (property names) for the given pathogen tab. */
export function getResultColumnKeys(pathogenId: string): string[] {
    return pathogenCatalog.find(entry => entry.id === pathogenId)?.resultColumnKeys ?? [];
}
