import { Component, Input, ViewChild } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { User } from '../../../user/model/user.model';
import { userConsentProfileStrings } from '../../user-consent.constants';
import { DataConsentService } from '../../services/data-consent.service';

@Component({
    standalone: false,
    selector: 'mibi-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

    @Input() currentUser!: User;
    @Input() institution = '';

    @ViewChild('consentCheckbox') consentCheckbox!: MatCheckbox;

    readonly consentStrings = userConsentProfileStrings;

    constructor(private consentService: DataConsentService) {}

    onConsentToggle(change: MatCheckboxChange): void {
        if (change.checked) {
            // Re-granting consent needs no confirmation.
            this.consentService.giveConsent();
        } else {
            // Withdrawing asks for confirmation; revert the tick if the user
            // backs out (or dismisses the dialog).
            this.consentService.requestWithdraw().subscribe(confirmed => {
                if (!confirmed) {
                    this.consentCheckbox.checked = true;
                }
            });
        }
    }
}
