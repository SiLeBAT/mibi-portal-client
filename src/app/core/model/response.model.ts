import { ITokenizedUser } from '../../user/model/models';

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
