import { TokenizedUser } from '../../user/model/user.model';
import { SampleData } from '../../samples/model/sample-management.model';

export interface AuthorizationResponseDTO {
    authorized: boolean;
    token: string;
}
export interface RecoverPasswordResponseDTO {
    title: string;
}

export interface RegisterUserResponseDTO {
    title: string;
}

export interface LoginResponseDTO {
    user: TokenizedUser;
    status: string;
}

export interface ActivationResponseDTO {
    activation: boolean;
}

export interface AdminActivateResponseDTO extends ActivationResponseDTO {
    obj: string;
    title: string;
}

export interface SystemInformationResponseDTO {
    version: string;
    lastChange: string;
}
interface ValidationResponseErrorEntryDTO {
    code: number;
    level: number;
    message: string;
}

interface ValidationResponseErrorCollectionDTO {
    [key: string]: ValidationResponseErrorEntryDTO[];
}

interface ValidationResponseCorrectionEntryDTO {
    field: keyof SampleData;
    original: string;
    correctionOffer: string[];
}

export interface ValidationResponseDTO {
    data: Record<string, string>;
    errors: ValidationResponseErrorCollectionDTO;
    corrections: ValidationResponseCorrectionEntryDTO[];
    edits: Record<string, string>;
}

interface QA {
    q: string;
    a: string;
}
export interface FAQResponseDTO {
    [key: string]: QA[];
}
