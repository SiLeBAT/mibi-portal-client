import { SampleProperty } from '../../samples/model/sample-management.model';
import { NRL } from '../../samples/model/sample.enums';

export type SamplePropertyValuesDTO = Record<SampleProperty, string>;
export type AnnotatedSampleDataDTO = Record<SampleProperty, AnnotatedSampleDataEntryDTO>;
export type SampleDataDTO = Record<SampleProperty, SampleDataEntryDTO>;
type UrgencyDTO = 'NORMAL' | 'EILT';

interface AddressDTO {
    readonly instituteName: string;
    readonly department?: string;
    readonly street: string;
    readonly zip: string;
    readonly city: string;
    readonly contactPerson: string;
    readonly telephone: string;
    readonly email: string;
}

interface AnalysisDTO {
    readonly species?: boolean;
    readonly serological?: boolean;
    readonly resistance?: boolean;
    readonly vaccination?: boolean;
    readonly molecularTyping?: boolean;
    readonly toxin?: boolean;
    readonly esblAmpCCarbapenemasen?: boolean;
    readonly sample?: boolean;
    readonly other?: string;
    readonly compareHuman?: {
        value: string;
        active: boolean;
    };
}

export interface SampleSetMetaDTO {
    readonly sender: AddressDTO;
    readonly fileName?: string;
    readonly customerRefNumber?: string;
    readonly signatureDate?: string;
    readonly version?: string;
}

interface SampleValidationErrorDTO {
    readonly code: number;
    readonly level: number;
    readonly message: string;
}

export interface SampleMetaDTO {
    nrl: NRL;
    analysis: AnalysisDTO;
    urgency: UrgencyDTO;
}

interface SampleBaseDTO {
    sampleMeta: SampleMetaDTO;
}
export interface AnnotatedSampleDTO extends SampleBaseDTO {
    sampleData: AnnotatedSampleDataDTO;
}

export interface SampleDTO extends SampleBaseDTO {
    sampleData: SampleDataDTO;
}

export interface SampleDataEntryDTO {
    value: string;
    oldValue?: string;
}

export interface AnnotatedSampleDataEntryDTO extends SampleDataEntryDTO {
    errors?: SampleValidationErrorDTO[];
    correctionOffer?: string[];
}

interface SampleSetDTOBase {
    readonly meta: SampleSetMetaDTO;
}

export interface AnnotatedSampleSetDTO extends SampleSetDTOBase {
    readonly samples: AnnotatedSampleDTO[];
}
export interface SampleSetDTO extends SampleSetDTOBase {
    readonly samples: SampleDTO[];
}

export interface AnnotatedOrderDTO {
    sampleSet: AnnotatedSampleSetDTO;
}
export interface OrderDTO {
    sampleSet: SampleSetDTO;
}
