import { NRLDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
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

/**
 * Resolves a sample's Erreger to its NRL via the NRL regex selectors, or
 * undefined when no selector matches.
 */
export type NrlMatcher = (erreger: string) => NRL | undefined;

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

// One column per line, in display order, so adding, removing, reordering or
// relabelling a column touches exactly one line.
const NRL_AR_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('Citrat'),
    column('H2S'),
    column('Indol'),
    column('Lactose'),
    column('O-AG'),
    column('e-hly'),
    column('eae'),
    column('stx1'),
    column('stx2'),
    column('CHL'),
    column('CIP'),
    column('COL'),
    column('GEN')
];

const NRL_SALM_RESULT_COLUMNS: ResultColumnDefinition[] = [
    column('Serovar'),
    column('Seroformel')
];

// The single place that maps an NRL to its result columns. The Record type makes
// the compiler demand an entry for every NRL; an NRL without a specified result
// set carries no result columns yet.
const nrlResultsConfig: Record<KnownNrl, NrlResultsConfig> = {
    [NRL.KL_Vibrio]: { fileToken: 'Vibrio', resultColumns: [] },
    [NRL.NRL_VTEC]: { fileToken: 'VTEC', resultColumns: [] },
    [NRL.L_Bacillus]: { fileToken: 'Bacillus', resultColumns: [] },
    [NRL.NRL_AR]: { fileToken: 'Ecoli', resultColumns: NRL_AR_RESULT_COLUMNS },
    [NRL.NRL_AR_Kleb]: { fileToken: 'Kleb', resultColumns: [] },
    [NRL.NRL_Campy]: { fileToken: 'Campy', resultColumns: [] },
    [NRL.NRL_Staph]: { fileToken: 'Staph', resultColumns: [] },
    [NRL.NRL_Listeria]: { fileToken: 'List', resultColumns: [] },
    [NRL.NRL_Salm]: { fileToken: 'Salmonella', resultColumns: NRL_SALM_RESULT_COLUMNS },
    [NRL.L_Clostridium]: { fileToken: 'Clost', resultColumns: [] },
    [NRL.KL_Yersinia]: { fileToken: 'Yers', resultColumns: [] }
};

function isKnownNrl(value: string): value is KnownNrl {
    return Object.prototype.hasOwnProperty.call(nrlResultsConfig, value);
}

function compileSelector(selector: string): RegExp | undefined {
    try {
        return new RegExp(selector, 'i');
    } catch {
        return undefined;
    }
}

/**
 * Builds the Erreger -> NRL matcher from the NRL list in the store. Same rules as
 * the server's NRLService: case-insensitive, the first matching NRL (in list
 * order) wins. Invalid patterns and NRLs unknown to the client are skipped.
 */
export function createNrlMatcher(nrls: NRLDTO[]): NrlMatcher {
    const compiled: { nrl: KnownNrl; regexps: RegExp[] }[] = [];
    nrls.forEach(dto => {
        const nrl = toNrl(dto.id);
        if (!isKnownNrl(nrl)) {
            return;
        }
        const regexps: RegExp[] = [];
        (dto.selector ?? []).forEach(selector => {
            const regexp = compileSelector(selector);
            if (regexp) {
                regexps.push(regexp);
            }
        });
        compiled.push({ nrl: nrl, regexps: regexps });
    });

    return (erreger: string): NRL | undefined => {
        if (!erreger) {
            return undefined;
        }
        return compiled.find(entry => entry.regexps.some(regexp => regexp.test(erreger)))?.nrl;
    };
}

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

function erregerOf(sample: SampleWithResultsDTO): string {
    return sample.sampleData.pathogen_avv?.value ?? '';
}

// Resolves the NRL tab for a sample: the regex match on its Erreger, else the
// NRL the server stored at upload. Samples whose laboratory still cannot be
// determined ("Labor nicht erkannt") get a tab labelled with their raw Erreger
// value so no data is hidden; they carry no result columns.
function resolveNrlTab(sample: SampleWithResultsDTO, matcher: NrlMatcher): NrlTab {
    const erreger = erregerOf(sample);
    const nrl = matcher(erreger) ?? toNrl(sample.sampleMeta?.nrl ?? '');
    if (isKnownNrl(nrl)) {
        return { id: nrl, label: nrl, fileToken: nrlResultsConfig[nrl].fileToken };
    }
    const label = erreger || 'Unbekannt';
    return {
        id: 'other:' + normalize(label),
        label: label,
        // Filename-safe fallback token: drop spaces and dots (e.g. "E. coli").
        fileToken: label.replace(/[\s.]+/g, '') || 'Unbekannt'
    };
}

/** Distinct NRLs present in the order, sorted alphabetically by label. */
export function deriveNrlTabs(samples: SampleWithResultsDTO[], matcher: NrlMatcher): NrlTab[] {
    const byId = new Map<string, NrlTab>();
    samples.forEach(sample => {
        const tab = resolveNrlTab(sample, matcher);
        if (!byId.has(tab.id)) {
            byId.set(tab.id, tab);
        }
    });
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Samples belonging to the given NRL tab, preserving order. */
export function filterSamplesByNrl(
    samples: SampleWithResultsDTO[],
    nrlId: string,
    matcher: NrlMatcher
): SampleWithResultsDTO[] {
    return samples.filter(sample => resolveNrlTab(sample, matcher).id === nrlId);
}

/** The result columns for the given NRL tab; none for an unknown/fallback tab. */
export function getResultColumns(nrlId: string): ResultColumnDefinition[] {
    return isKnownNrl(nrlId) ? nrlResultsConfig[nrlId].resultColumns : [];
}
