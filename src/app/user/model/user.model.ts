export interface User {
    id: string;
    email: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    instituteId: string;
}
export interface TokenizedUser extends User {
    token: string;
}

export enum UserState {
    'UNINITIALIZED',
    'LOGGED_ON',
    'LOGGED_OFF'
}

export interface Credentials {
    readonly email: string;
    readonly password: string;
}

export interface RegistrationDetails extends Credentials {
    readonly firstName: string;
    readonly lastName: string;
    readonly instituteId: string;
}

export interface UserRegistrationRequest {
    email: string;
}

export interface UserPasswordResetRequest {
    email: string;
}

export interface UserActivation {
    activation: boolean;
    username: string;
}
