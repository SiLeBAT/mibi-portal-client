import { Injectable } from '@angular/core';

import * as _ from 'lodash';
// @ts-ignore
import * as XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { WindowRefService } from './window-ref.service';
import {
    SampleSheet,
    ImportedExcelFileDetails, SampleData, VALID_SHEET_NAME, FORM_PROPERTIES, ExcelFileBlob, ChangedValueCollection
} from '../model/sample-management.model';
import { ClientError } from '../../core/model/client-error';

// TODO: Actionize
@Injectable({
    providedIn: 'root'
})
export class ExcelConverterService {

    private _window: any;

    constructor(windowRef: WindowRefService) {
        this._window = windowRef.nativeWindow;
    }

    async convertToExcel(data: SampleSheet, fileNameAddon: string = ''): Promise<ExcelFileBlob> {

        if (!data.workSheet) {
            throw new ClientError('No Excel data available.');
        }
        const file: File = data.workSheet.file;
        const oriFileName = file.name;
        const entries: string[] = oriFileName.split('.xlsx');
        let fileName: string = '';
        if (entries.length > 0) {
            fileName += entries[0];
        }

        fileName += fileNameAddon + '.xlsx';

        const highlights = data.formData.map(e => e.edits);
        const dataToSave = this.fromDataObjToAOO(data.formData.map(e => e.data));
        let workbook = await this.fromFileToWorkbook(file);
        workbook = this.addValidatedDataToWorkbook(data.workSheet, workbook, dataToSave, highlights);

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

    private addValidatedDataToWorkbook(
        originalWorkSheet: ImportedExcelFileDetails, workbook: any, dataToSave: any, highlights: ChangedValueCollection[] = []) {

        const oriDataLength = originalWorkSheet.oriDataLength;
        const searchTerm = 'Ihre Probe-';
        const sheet = workbook.sheet(VALID_SHEET_NAME);

        if (sheet) {
            const startCol = 'A';
            const endCol = String.fromCharCode(startCol.charCodeAt(0) + FORM_PROPERTIES.length);
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

                const startRow = (rowNumber + 1);
                const startCell = startCol + startRow;
                sheet.cell(startCell).value(dataToSave);
                try {
                    const endCell = endCol + (startRow + dataToSave.length);
                    const rng = sheet.range(startCell + ':' + endCell);
                    rng.style({ fill: 'ffffff' });
                    this.highlightEdits(sheet, highlights, startCol, startRow);

                } catch (e) {
                    throw new ClientError('Unable to apply styling to Excel');
                }

            }
        }
        return workbook;
    }

    private highlightEdits(sheet: any, highlights: ChangedValueCollection[], startCol: string, startRow: number) {
        _.forEach(highlights,
            (row, index) => {
                if (!_.isEmpty(row)) {
                    _.forEach(row, (v, k) => {
                        const col = _.findIndex(FORM_PROPERTIES, e => e === k);
                        if (col !== -1) {
                            const changedCol = String.fromCharCode(startCol.charCodeAt(0) + col);
                            sheet.cell(changedCol + (startRow + index)).style({ fill: '0de5cf' });
                        }

                    });

                }
            }
        );
    }
}
