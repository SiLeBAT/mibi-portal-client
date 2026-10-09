import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { NRL } from '../../../samples/model/sample.enums';
import { toNrl } from '../../../samples/model/nrl';

/** A result column of an NRL: which resultData property it shows, under which header. */
export interface ResultColumnDefinition {
    key: string;
    header: string;
}

/** An NRL tab as shown in the results view secondary bar (ticket #875). */
export interface NrlTab {
    id: string;
    label: string;
    // Filename-safe token used in the CSV download names (ticket #786), e.g.
    // "Ecoli", "Salmonella".
    fileToken: string;
}

type KnownNrl = Exclude<NRL, NRL.UNKNOWN>;

interface NrlResultsConfig {
    // Kept from the former pathogen tabs so the download filenames stay unchanged
    // until the PO decides on NRL-based names.
    fileToken: string;
    resultColumns: ResultColumnDefinition[];
}

// Header text = the resultData property name for now; pass a second argument
// once a column gets a label of its own.
function column(key: string, header: string = key): ResultColumnDefinition {
    return { key: key, header: header };
}

// The result column sets per NRL as specified in ticket #876. The key is the
// resultData property name the LIMS delivers, which is also the header.
// One column per line, in display order, so adding, removing, reordering or
// relabelling a column touches exactly one line.
const NRL_VTEC_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('ehxA-Gen'),
    column('eae-Gen'),
    column('stx1-Gen'),
    column('stx2-Gen'),
    column('nleB-Gen'),
    column('stx-Subtyp'),
    column('Ergebnis'),
    column('Serotyp'),
    column('Bemerkung')
];

const KL_VIBRIO_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('VptoxR (297bp)'),
    column('tdh (425bp)'),
    column('trh (500bp)'),
    column('737bp, Identifikation als V. alginolyticus like sp.'),
    column('Spezies')
];

// Shared by NRL-AR and NRL-AR-Kleb, which report the same results.
const NRL_AR_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('Wachstum MC+1FOT'),
    column('Wachstum auf ChromID CARBA-Agar'),
    column('Wachstum auf ChromID OXA-48-Agar'),
    column('MALDI Biotyper'),
    column('Bemerkung')
];

const NRL_STAPH_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('CHROMagar MRSA Koloniemorphologie'),
    column('Hämolyse'),
    column('nuc/mecA/PVL/seb'),
    column('spa-Typ'),
    column('Diagnose'),
    column('MHK CHL'),
    column('MHK CIP'),
    column('MHK CLI'),
    column('MHK GEN'),
    column('MHK ERY'),
    column('MHK FOX'),
    column('MHK FUS'),
    column('MHK KAN'),
    column('MHK LZD'),
    column('MHK MUP'),
    column('MHK PEN'),
    column('MHK RIF'),
    column('MHK STR'),
    column('MHK SMX'),
    column('MHK SYN'),
    column('MHK TET'),
    column('MHK TIA'),
    column('MHK VAN'),
    column('MHK TMP'),
    column('Resistenztyp'),
    column('Resistenzprofil'),
    column('Messwert (VIDAS)'),
    column('Nachweis von SEA-SEE in der Probe (VIDAS)'),
    column('Messwert (Ridascreen)'),
    column('Nachweis von SEA-SEE in der Probe (Ridascreen)'),
    column('sea'),
    column('seb'),
    column('sec'),
    column('sed'),
    column('see'),
    column('seg'),
    column('seh'),
    column('sei'),
    column('sep'),
    column('Serotyp'),
    column('Bemerkung')
];

const L_BACILLUS_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('Phänotypie'),
    column('Diagnose'),
    column('cya-Gen (pXO1)'),
    column('capB-Gen (pXO2)'),
    column('nheA/B/C-Gene'),
    column('hblC/D/A-Gene'),
    column('cytK-1-Gen'),
    column('cytK-2-Gen'),
    column('ces-Gen'),
    column('Parasporale Kristalle'),
    column('Cereulid-Gehalt'),
    column('Bemerkung')
];

const L_CLOSTRIDIUM_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('Phänotypie'),
    column('Diagnose'),
    column('tcdA-Gen'),
    column('tcdB-Gen'),
    column('cdtA-Gen (binäres Toxin)'),
    column('Ribotyp'),
    column('cpa-Gen'),
    column('cpe-Gen'),
    column('cpb-Gen'),
    column('cpb2-Gen'),
    column('etx-Gen'),
    column('iap-Gen')
];

const KL_YERSINIA_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('Gattung'),
    column('Spezies'),
    column('Biotyp'),
    column('Serotyp'),
    column('O-Antigen'),
    column('ail (454bp)'),
    column('virF (700bp)'),
    column('O:3 (450bp)'),
    column('O:9 (837bp)')
];

const NRL_SALM_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('Serovar'),
    column('Seroformel')
];

// The single place that maps an NRL to its result columns. The Record type makes
// the compiler demand an entry for every NRL. The result sets of NRL-Campy and
// NRL-Listeria are not specified yet, so they carry no result columns.
const nrlResultsConfig: Record<KnownNrl, NrlResultsConfig> = {
    [NRL.KL_Vibrio]: { fileToken: 'Vibrio', resultColumns: KL_VIBRIO_RESULT_COLUMNS },
    [NRL.NRL_VTEC]: { fileToken: 'VTEC', resultColumns: NRL_VTEC_RESULT_COLUMNS },
    [NRL.L_Bacillus]: { fileToken: 'Bacillus', resultColumns: L_BACILLUS_RESULT_COLUMNS },
    [NRL.NRL_AR]: { fileToken: 'Ecoli', resultColumns: NRL_AR_RESULT_COLUMNS },
    [NRL.NRL_AR_Kleb]: { fileToken: 'Kleb', resultColumns: NRL_AR_RESULT_COLUMNS },
    [NRL.NRL_Campy]: { fileToken: 'Campy', resultColumns: [] },
    [NRL.NRL_Staph]: { fileToken: 'Staph', resultColumns: NRL_STAPH_RESULT_COLUMNS },
    [NRL.NRL_Listeria]: { fileToken: 'List', resultColumns: [] },
    [NRL.NRL_Salm]: { fileToken: 'Salmonella', resultColumns: NRL_SALM_RESULT_COLUMNS },
    [NRL.L_Clostridium]: { fileToken: 'Clost', resultColumns: L_CLOSTRIDIUM_RESULT_COLUMNS },
    [NRL.KL_Yersinia]: { fileToken: 'Yers', resultColumns: KL_YERSINIA_RESULT_COLUMNS }
};

function isKnownNrl(value: string): value is KnownNrl {
    return Object.prototype.hasOwnProperty.call(nrlResultsConfig, value);
}

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

function erregerOf(sample: SampleWithResultsDTO): string {
    return sample.sampleData.pathogen_avv?.value ?? '';
}

// Resolves the NRL tab for a sample from the NRL the server assigned to it at
// upload (sampleMeta.nrl). Samples whose laboratory could not be determined
// ("Labor nicht erkannt") get a tab labelled with their raw Erreger value so no
// data is hidden; they carry no result columns.
function resolveNrlTab(sample: SampleWithResultsDTO): NrlTab {
    const nrl = toNrl(sample.sampleMeta?.nrl ?? '');
    if (isKnownNrl(nrl)) {
        return { id: nrl, label: nrl, fileToken: nrlResultsConfig[nrl].fileToken };
    }
    const label = erregerOf(sample) || 'Unbekannt';
    return {
        id: 'other:' + normalize(label),
        label: label,
        // Filename-safe fallback token: drop spaces and dots (e.g. "E. coli").
        fileToken: label.replace(/[\s.]+/g, '') || 'Unbekannt'
    };
}

/** Distinct NRLs present in the order, sorted alphabetically by label. */
export function deriveNrlTabs(samples: SampleWithResultsDTO[]): NrlTab[] {
    const byId = new Map<string, NrlTab>();
    samples.forEach(sample => {
        const tab = resolveNrlTab(sample);
        if (!byId.has(tab.id)) {
            byId.set(tab.id, tab);
        }
    });
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Samples belonging to the given NRL tab, preserving order. */
export function filterSamplesByNrl(samples: SampleWithResultsDTO[], nrlId: string): SampleWithResultsDTO[] {
    return samples.filter(sample => resolveNrlTab(sample).id === nrlId);
}

/** The result columns for the given NRL tab; none for an unknown/fallback tab. */
export function getResultColumns(nrlId: string): ResultColumnDefinition[] {
    return isKnownNrl(nrlId) ? nrlResultsConfig[nrlId].resultColumns : [];
}
