import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
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

    // Stage 1 = initial message; stage 2 ("confirming") reveals the
    // type-"delete" section. The first withdraw click switches to stage 2.
    confirming = false;
    readonly confirmControl = new FormControl('');

    constructor(
        private dialogRef: MatDialogRef<WithdrawConsentDialogComponent, boolean>
    ) {}

    // True once the user has typed exactly the confirmation token (case-sensitive).
    get confirmed(): boolean {
        return this.confirmControl.value === this.strings.confirmToken;
    }

    // The withdraw button is the highlighted (primary) button in stage 1 only
    // once "delete" has been typed; the Back button is highlighted otherwise.
    get withdrawHighlighted(): boolean {
        return this.confirming && this.confirmed;
    }

    // In stage 2 the withdraw button stays inactive until "delete" is typed.
    get withdrawDisabled(): boolean {
        return this.confirming && !this.confirmed;
    }

    // Closing with false (also the result when the user clicks outside the
    // dialog) keeps the consent; only the explicit withdraw button revokes it.
    onBack(): void {
        this.dialogRef.close(false);
    }

    onWithdraw(): void {
        if (!this.confirming) {
            // First click only reveals the confirmation section; it does not
            // withdraw yet (and the button then deactivates until "delete").
            this.confirming = true;
            return;
        }
        if (this.confirmed) {
            this.dialogRef.close(true);
        }
    }
}
