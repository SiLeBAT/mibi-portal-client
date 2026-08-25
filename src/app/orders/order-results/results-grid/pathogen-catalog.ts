import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { NRL } from '../../../samples/model/sample.enums';

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
    resultColumnKeys: string[];
}

// Result column sets per pathogen. Header text = the resultData property name
// for now (a property-name -> label mapping will be added later, see #756).
// Only these two sets are known; the remaining pathogens carry no result columns
// until their sets are specified (ticket #827).
const ESCHERICHIA_COLI_RESULT_KEYS: string[] = [
    'Citrat', 'H2S', 'Indol', 'Lactose', 'O-AG', 'e-hly', 'eae', 'stx1', 'stx2', 'CHL', 'CIP', 'COL', 'GEN'
];
const SALMONELLA_RESULT_KEYS: string[] = ['Serovar', 'Seroformel'];

// A sample's pathogen tab is keyed on the BfR laboratory (NRL) that the server
// already resolved for it, not on the raw Erreger text: the NRL selectors are the
// only thing that separates "Escherichia coli" (NRL-AR) from "Escherichia coli
// O157" (NRL-VTEC), which a prefix match on the Erreger value merged into one tab
// (ticket #827). The tab id is the NRL value itself.
const pathogenCatalog: PathogenCatalogEntry[] = [
    {
        id: NRL.L_Bacillus,
        fullName: 'Bacillus',
        abbreviation: 'Bacillus',
        fileToken: 'Bacillus',
        resultColumnKeys: []
    },
    {
        id: NRL.NRL_Campy,
        fullName: 'Campylobacter',
        abbreviation: 'Campy',
        fileToken: 'Campy',
        resultColumnKeys: []
    },
    {
        id: NRL.L_Clostridium,
        fullName: 'Clostridium',
        abbreviation: 'Clost',
        fileToken: 'Clost',
        resultColumnKeys: []
    },
    {
        id: NRL.NRL_AR,
        fullName: 'Escherichia coli',
        abbreviation: 'E. coli',
        fileToken: 'Ecoli',
        resultColumnKeys: ESCHERICHIA_COLI_RESULT_KEYS
    },
    {
        id: NRL.NRL_AR_Kleb,
        fullName: 'Klebsiella',
        abbreviation: 'Kleb',
        fileToken: 'Kleb',
        resultColumnKeys: []
    },
    {
        id: NRL.NRL_Listeria,
        fullName: 'Listeria monocytogenes',
        abbreviation: 'List',
        fileToken: 'List',
        resultColumnKeys: []
    },
    {
        id: NRL.NRL_Salm,
        fullName: 'Salmonella',
        abbreviation: 'Salm',
        fileToken: 'Salmonella',
        resultColumnKeys: SALMONELLA_RESULT_KEYS
    },
    {
        id: NRL.NRL_Staph,
        fullName: 'Staphylococcus aureus',
        abbreviation: 'Staph',
        fileToken: 'Staph',
        resultColumnKeys: []
    },
    {
        id: NRL.KL_Vibrio,
        fullName: 'Vibrio',
        abbreviation: 'Vibrio',
        fileToken: 'Vibrio',
        resultColumnKeys: []
    },
    {
        id: NRL.NRL_VTEC,
        fullName: 'Pathogene Escherichia coli',
        abbreviation: 'VTEC',
        fileToken: 'VTEC',
        resultColumnKeys: []
    },
    {
        id: NRL.KL_Yersinia,
        fullName: 'Yersinia',
        abbreviation: 'Yers',
        fileToken: 'Yers',
        resultColumnKeys: []
    }
];

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

function nrlOf(sample: SampleWithResultsDTO): string {
    return sample.sampleMeta?.nrl ?? '';
}

function erregerOf(sample: SampleWithResultsDTO): string {
    return sample.sampleData.pathogen_avv?.value ?? '';
}

// Resolves the pathogen for a sample. Samples whose laboratory could not be
// determined ("Labor nicht erkannt") still get a tab, labelled with their raw
// Erreger value so no data is hidden; they carry no result columns.
function resolvePathogen(sample: SampleWithResultsDTO): PathogenCatalogEntry {
    const nrl = nrlOf(sample);
    const match = pathogenCatalog.find(entry => entry.id === nrl);
    if (match) {
        return match;
    }
    const label = erregerOf(sample) || 'Unbekannt';
    return {
        id: 'other:' + normalize(label),
        fullName: label,
        abbreviation: label,
        // Filename-safe fallback token: drop spaces and dots (e.g. "E. coli").
        fileToken: label.replace(/[\s.]+/g, '') || 'Unbekannt',
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
