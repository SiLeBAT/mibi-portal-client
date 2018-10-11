import { Injectable } from '@angular/core';

import * as _ from 'lodash';
// @ts-ignore
import * as XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { WindowRefService } from './window-ref.service';
import {
    ISampleSheet,
    IImportedExcelFileDetails, SampleData, VALID_SHEET_NAME, FORM_PROPERTIES, IExcelFileBlob
} from '../model/sample-management.model';

// TODO: Actionize
@Injectable({
    providedIn: 'root'
})
export class ExcelConverterService {

    private _window: any;

    constructor(windowRef: WindowRefService) {
        this._window = windowRef.nativeWindow;
    }

    async convertToExcel(data: ISampleSheet): Promise<IExcelFileBlob> {

        if (!data.workSheet) {
            throw new Error('No Excel data available.');
        }
        const file: File = data.workSheet.file;
        const oriFileName = file.name;
        const entries: string[] = oriFileName.split('.xlsx');
        let fileName: string = '';
        if (entries.length > 0) {
            fileName += entries[0];
        }
        fileName += '_validated.xlsx';

        const dataToSave = this.fromDataObjToAOO(data.formData.map(e => e.data));
        let workbook = await this.fromFileToWorkbook(file);
        workbook = this.addValidatedDataToWorkbook(data.workSheet, workbook, dataToSave);

        const blob = await workbook.outputAsync();

        return {
            blob: blob,
            fileName: fileName
        };

    }

    private async fromFileToWorkbook(file: File) {
        this._window['IQc'] = { entity: 'x', ENTITIES: { x: 'x' } };
        const workbook = await XlsxPopulate.fromDataAsync(file);
        delete this._window['IQc'];
        return workbook;
    }

    private fromDataObjToAOO(data: SampleData[]): any {
        const dataToSave: any = [];

        _.forEach(data, ((dataRow: any) => {
            const row: any[] = [];
            _.forEach(FORM_PROPERTIES, ((header) => {
                row.push(dataRow[header]);
            }));
            dataToSave.push(row);
        }));

        return dataToSave;
    }

    private addValidatedDataToWorkbook(originalWorkSheet: IImportedExcelFileDetails, workbook: any, dataToSave: any) {

        const oriDataLength = originalWorkSheet.oriDataLength;
        const searchTerm = 'Ihre Probe-';
        const sheet = workbook.sheet(VALID_SHEET_NAME);

        if (sheet) {
            const result = sheet.find(searchTerm);
            if (result.length > 0) {
                const cell = result[0];
                const rowNumber = cell.row().rowNumber();

                for (let i = (rowNumber + 1); i <= (rowNumber + oriDataLength); i++) {
                    for (let j = 1; j <= FORM_PROPERTIES.length; j++) {
                        const cell2 = sheet.row(i).cell(j);
                        cell2.value(undefined);
                    }
                }

                const startCell = 'A' + (rowNumber + 1);
                sheet.cell(startCell).value(dataToSave);
            }
        }
        return workbook;
    }
}
