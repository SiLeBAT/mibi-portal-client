import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ExcelVersionDialogData {
    title: string;
    string1: string;
    string2: string;
    string3: string;
    link: string;
    string4: string;
  }

@Component({
    selector: 'mibi-send-excel-version-dialog',
    templateUrl: 'excel-version-dialog.component.html',
    styleUrls: ['./excel-version-dialog.component.scss']
})
export class ExcelVersionDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: ExcelVersionDialogData) { }
}
