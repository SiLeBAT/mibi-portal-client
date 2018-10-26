import { ITokenizedUser } from '../../user/model/user.model';
import { SampleData } from '../../samples/model/sample-management.model';

export interface IRecoverPasswordResponseDTO {
    title: string;
}

export interface IRegisterUserResponseDTO {
    title: string;
}

export interface ILoginResponseDTO {
    obj: ITokenizedUser;
    title: string;
}

export interface IActivationResponseDTO {
    activation: boolean;
}

export interface IAdminActivateResponseDTO extends IActivationResponseDTO {
    obj: string;
    title: string;
}

export interface ISystemInformationResponseDTO {
    version: string;
    lastChange: string;
}
interface IValidationResponseErrorEntryDTO {
    code: number;
    level: number;
    message: string;
}

interface IValidationResponseErrorCollectionDTO {
    [key: string]: IValidationResponseErrorEntryDTO[];
}

interface IValidationResponseCorrectionEntryDTO {
    field: keyof SampleData;
    original: string;
    correctionOffer: string[];
}

export interface IValidationResponseDTO {
    data: Record<string, string>;
    errors: IValidationResponseErrorCollectionDTO;
    corrections: IValidationResponseCorrectionEntryDTO[];
    edits: Record<string, string>;
}

interface IQA {
    q: string;
    a: string;
}
export interface IFAQResponseDTO {
    [key: string]: IQA[];
}
