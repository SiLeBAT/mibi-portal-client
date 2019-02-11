import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ComponentType } from '@angular/cdk/overlay';
import { DialogConfiguration, DialogData, MATDIALOGCONFIG } from '../model/dialog.model';
import { Action } from '@ngrx/store';

// New dialog system

@Injectable({
    providedIn: 'root'
})
export class DialogService {

    constructor(private dialog: MatDialog) { }

    openDialog<T extends DialogConfiguration>(
      component: ComponentType<any>,
      configuration: T, confirmAction?: Action,
      cancelAction?: Action) {
        const data: DialogData<T> = { configuration : configuration, confirmAction : confirmAction, cancelAction : cancelAction };
        this.dialog.open(component, { width: MATDIALOGCONFIG.width, data : data });
    }
}
