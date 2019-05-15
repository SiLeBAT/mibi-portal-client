import { SampleSetDTO, AnnotatedSampleSetDTO } from './shared-dto.model';

export interface MarshalDataRequestDTO {
    readonly data: AnnotatedSampleSetDTO;
    readonly filenameAddon: string;
}

export interface SampleSubmissionDTO {
    readonly order: SampleSetDTO;
    readonly comment: string;
}

export interface ResetRequestDTO {
    readonly email: string;
}

export interface NewPasswordRequestDTO {
    readonly password: string;
}

export interface RegistrationDetailsDTO {
    readonly email: string;
    readonly password: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly instituteId: string;
}
