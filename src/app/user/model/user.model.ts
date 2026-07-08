import { EmailNotificationSettings } from '../../core/model/email-notification-settings.model';

export interface User {
    email: string;
    firstName?: string;
    lastName?: string;
    instituteId: string;
    // Data-save consent: whether the user agreed to store their sample data and
    // whether they have been asked at all (drives the post-login consent popup).
    dataSaveAgreed?: boolean;
    dataSaveViewed?: boolean;
    // How often the user wants to be emailed about new BfR analysis results.
    emailNotificationSettings?: EmailNotificationSettings;
}
export interface TokenizedUser extends User {
    token: string;
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
