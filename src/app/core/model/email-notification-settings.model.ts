export type EmailNotificationFrequency = 'daily' | 'weekly' | 'monthly';

export type EmailNotificationWeekday =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday';

export type EmailNotificationWeekOfMonth = '1' | '2' | '3' | '4' | 'last';

/**
 * A user's preference for how often they want to be informed by email about new
 * BfR analysis results. Persisted on the related User_Info object server-side.
 */
export interface EmailNotificationSettings {
    enabled: boolean;
    frequency: EmailNotificationFrequency;
    weekday: EmailNotificationWeekday;
    weekOfMonth: EmailNotificationWeekOfMonth;
}

export const DEFAULT_EMAIL_NOTIFICATION_SETTINGS: EmailNotificationSettings = {
    enabled: false,
    frequency: 'daily',
    weekday: 'monday',
    weekOfMonth: '1'
};
