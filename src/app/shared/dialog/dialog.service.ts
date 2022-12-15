import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/overlay';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    constructor(private dialog: MatDialog) { }

    openDialog(component: ComponentType<unknown>, matConfiguration?: MatDialogConfig) {
        this.dialog.open(component, matConfiguration);
    }
}
