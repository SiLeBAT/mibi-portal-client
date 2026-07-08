import { EmailNotificationSettings } from '../../core/model/email-notification-settings.model';

export interface MeResponse {
    sub: string;
    email: string;
    preferred_username: string;
    dataSaveAgreed: boolean;
    dataSaveViewed: boolean;
    emailNotificationSettings: EmailNotificationSettings;
}

export interface LogoutResponse {
    endSessionUrl: string;
}
