// Contract for the browser-parsed sample sheet sent to the API instead of a raw
// .xlsx file (MPS-312). Mirrors the cloud's `UnmarshalSampleSheet` MINUS each
// sample's `meta` (nrl/analysis/urgency) — those are filled in server-side by the
// NRL enrichment step, which needs database-backed data unavailable in the browser.

export enum ParsedUrgency {
    NORMAL = 'NORMAL',
    URGENT = 'EILT'
}

// Numeric to match the cloud's SampleSheetAnalysisOption enum (OMIT = 0, ACTIVE = 1).
export enum ParsedAnalysisOption {
    OMIT = 0,
    ACTIVE = 1
}

export interface ParsedAddress {
    instituteName: string;
    department?: string;
    street: string;
    zipCity: string;
    contactPerson: string;
    telephone: string;
    email: string;
}

export interface ParsedSampleSheetAnalysis {
    species: ParsedAnalysisOption;
    serological: ParsedAnalysisOption;
    resistance: ParsedAnalysisOption;
    vaccination: ParsedAnalysisOption;
    molecularTyping: ParsedAnalysisOption;
    toxin: ParsedAnalysisOption;
    esblAmpCCarbapenemasen: ParsedAnalysisOption;
    other: ParsedAnalysisOption;
    otherText: string;
    compareHuman: ParsedAnalysisOption;
    compareHumanText: string;
}

export interface ParsedSampleSheetMeta {
    nrl: string;
    urgency: ParsedUrgency;
    sender: ParsedAddress;
    analysis: ParsedSampleSheetAnalysis;
    fileName: string;
    customerRefNumber: string;
    signatureDate: string;
    version: string;
}

export interface ParsedSampleDataEntry {
    value: string;
    errors: [];
    correctionOffer: [];
}

export interface ParsedSample {
    data: Record<string, ParsedSampleDataEntry>;
}

export interface ParsedSampleSheet {
    samples: ParsedSample[];
    meta: ParsedSampleSheetMeta;
}
