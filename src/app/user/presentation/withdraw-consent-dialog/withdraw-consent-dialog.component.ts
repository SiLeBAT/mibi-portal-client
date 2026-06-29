import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { userConsentWithdrawStrings } from '../../user-consent.constants';

@Component({
    standalone: false,
    selector: 'mibi-withdraw-consent-dialog',
    templateUrl: './withdraw-consent-dialog.component.html',
    styleUrls: ['./withdraw-consent-dialog.component.scss']
})
export class WithdrawConsentDialogComponent {
    readonly strings = userConsentWithdrawStrings;

    constructor(
        private dialogRef: MatDialogRef<WithdrawConsentDialogComponent, boolean>
    ) {}

    // Closing with false (also the result when the user clicks outside the
    // dialog) keeps the consent; only the explicit withdraw button revokes it.
    onBack(): void {
        this.dialogRef.close(false);
    }

    onWithdraw(): void {
        this.dialogRef.close(true);
    }
}
