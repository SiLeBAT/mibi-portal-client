import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { newClientVersionDialogStrings } from '../../constants/version-check.constants';

/**
 * Shown when this browser tab still runs a client that the server has since
 * replaced. The dialog is opened with `disableClose`, so its single button is
 * the only way out; closing it triggers the reload (see VersionCheckService).
 */
@Component({
    standalone: false,
    selector: 'mibi-new-client-version-dialog',
    templateUrl: './new-client-version-dialog.component.html',
    styleUrls: ['./new-client-version-dialog.component.scss']
})
export class NewClientVersionDialogComponent {
    readonly strings = newClientVersionDialogStrings;

    constructor(
        private dialogRef: MatDialogRef<NewClientVersionDialogComponent>
    ) {}

    onReload(): void {
        this.dialogRef.close();
    }
}
