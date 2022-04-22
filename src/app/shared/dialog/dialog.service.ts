import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/overlay';
import { dialogMatConfiguration } from './dialog.constants';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    constructor(private dialog: MatDialog) { }

    openDialog(component: ComponentType<unknown>, matConfiguration = dialogMatConfiguration) {
        this.dialog.open(component, matConfiguration);
    }
}
