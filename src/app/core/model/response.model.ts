import { AnnotatedOrderDTO, OrderDTO } from './shared-dto.model';


export interface ParseResponse<T> {
    results: T[];
}

export interface ParseEntityDTO {
    objectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ParseInstitutionDTO extends ParseEntityDTO {
    readonly state_short: string;
    readonly name1: string;
    readonly name2: string;
    readonly city: string;
    readonly zip: string;
    readonly phone: string;
    readonly fax: string;
    readonly email: string[];
}
export interface TokenRefreshResponseDTO {
    readonly refresh: boolean;
    readonly token: string;
}
export interface RegistrationRequestResponseDTO {
    readonly registerRequest: boolean;
    readonly email: string;
}

export interface PasswordResetRequestResponseDTO {
    readonly passwordResetRequest: boolean;
    readonly email: string;
}

export interface PasswordResetResponseDTO {
    readonly passwordReset: boolean;
}

export interface ActivationResponseDTO {
    readonly activation: boolean;
    readonly username: string;
}

export interface TokenizedUserDTO {
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly instituteId: string;
    readonly token: string;
}

export interface SystemInformationResponseDTO {
    readonly version: string;
    readonly lastChange: string;
    readonly supportContact: string;
}
export interface InstituteDTO {
    readonly id: string;
    readonly short: string;
    readonly name: string;
    readonly addendum: string;
    readonly city: string;
    readonly zip: string;
    readonly phone: string;
    readonly fax: string;
    readonly email: string[];
}

export interface NRLDTO {
    readonly id: string;
    readonly standardProcedures: AnalysisProcedureDTO[];
    readonly optionalProcedures: AnalysisProcedureDTO[];
}

export interface AnalysisProcedureDTO {
    readonly value: string;
    readonly key: number;
}

export interface NRLCollectionDTO {
    readonly nrls: NRLDTO[];
}
export interface InstituteCollectionDTO {
    readonly institutes: InstituteDTO[];
}
export interface PutSamplesXLSXResponseDTO {
    readonly data: string;
    readonly fileName: string;
    readonly type: string;
}

export interface PutSamplesJSONResponseDTO {
    order: OrderDTO;
}

export interface PutValidatedResponseDTO {
    order: AnnotatedOrderDTO;
}

export interface PostSubmittedResponseDTO {
    order: AnnotatedOrderDTO;
}

export interface FaqEntryDTO {
    q: string;
    a: string;
}

export interface FaqSectionDTO {
    title: string;
    url: string;
    faq: FaqEntryDTO[];
}

export interface FaqResponseDTO {
    topFaq: FaqEntryDTO[];
    sections: FaqSectionDTO[];
}

