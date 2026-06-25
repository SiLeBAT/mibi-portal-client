import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { userConsentDialogStrings } from '../../user-consent.constants';

@Component({
    standalone: false,
    selector: 'mibi-data-consent-dialog',
    templateUrl: './data-consent-dialog.component.html',
    styleUrls: ['./data-consent-dialog.component.scss']
})
export class DataConsentDialogComponent {
    readonly strings = userConsentDialogStrings;

    // null until the user picks a radio button; the Speichern button stays
    // disabled while it is null.
    selectedChoice: boolean | null = null;

    constructor(
        private dialogRef: MatDialogRef<DataConsentDialogComponent, boolean>
    ) {}

    get isSaveDisabled(): boolean {
        return this.selectedChoice === null;
    }

    onSelectionChange(change: MatRadioChange): void {
        this.selectedChoice = change.value;
    }

    onSave(): void {
        if (this.selectedChoice === null) {
            return;
        }
        this.dialogRef.close(this.selectedChoice);
    }
}
