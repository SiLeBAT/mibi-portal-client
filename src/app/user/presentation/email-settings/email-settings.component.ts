import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import {
    DEFAULT_EMAIL_NOTIFICATION_SETTINGS,
    EmailNotificationFrequency,
    EmailNotificationSettings,
    EmailNotificationWeekOfMonth,
    EmailNotificationWeekday
} from '../../../core/model/email-notification-settings.model';
import { emailSettingsStrings } from '../../email-settings.constants';
import { User } from '../../model/user.model';
import { EmailSettingsService } from '../../services/email-settings.service';

@Component({
    standalone: false,
    selector: 'mibi-email-settings',
    templateUrl: './email-settings.component.html',
    styleUrls: ['./email-settings.component.scss']
})
export class EmailSettingsComponent implements OnInit {
    @Input() currentUser!: User;

    readonly strings = emailSettingsStrings;
    settings: EmailNotificationSettings = {
        ...DEFAULT_EMAIL_NOTIFICATION_SETTINGS
    };

    constructor(private emailSettingsService: EmailSettingsService) {}

    ngOnInit(): void {
        this.settings = {
            ...DEFAULT_EMAIL_NOTIFICATION_SETTINGS,
            ...this.currentUser?.emailNotificationSettings
        };
    }

    onEnabledToggle(change: MatCheckboxChange): void {
        this.settings = { ...this.settings, enabled: change.checked };
        this.persist();
    }

    onFrequencyChange(change: MatRadioChange): void {
        this.settings = {
            ...this.settings,
            frequency: change.value as EmailNotificationFrequency
        };
        this.persist();
    }

    onWeekdayChange(change: MatRadioChange): void {
        this.settings = {
            ...this.settings,
            weekday: change.value as EmailNotificationWeekday
        };
        this.persist();
    }

    onWeekOfMonthChange(change: MatRadioChange): void {
        this.settings = {
            ...this.settings,
            weekOfMonth: change.value as EmailNotificationWeekOfMonth
        };
        this.persist();
    }

    private persist(): void {
        this.emailSettingsService.save(this.settings);
    }
}
