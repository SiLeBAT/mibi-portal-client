import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/overlay';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    constructor(private dialog: MatDialog) { }

    openDialog(component: ComponentType<unknown>, matConfiguration?: MatDialogConfig): MatDialogRef<unknown> {
        return this.dialog.open(component, matConfiguration);
    }
}
