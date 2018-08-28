import { Injectable } from '@angular/core';

import * as _ from 'lodash';
// @ts-ignore
import * as XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';

import { WindowRefService } from './window-ref.service';
import { IExcelFileBlob } from './excel-converter.service';
import { ISampleSheet, IWorkSheet, SampleData } from '../models/sample-management.model';

export interface IExcelFileBlob {
    blob: Blob;
    fileName: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExcelConverterService {

    private currentHeaders: string[] = [
        'sample_id',
        'sample_id_avv',
        'pathogen_adv',
        'pathogen_text',
        'sampling_date',
        'isolation_date',
        'sampling_location_adv',
        'sampling_location_zip',
        'sampling_location_text',
        'topic_adv',
        'matrix_adv',
        'matrix_text',
        'process_state_adv',
        'sampling_reason_adv',
        'sampling_reason_text',
        'operations_mode_adv',
        'operations_mode_text',
        'vvvo',
        'comment'
    ];
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

        const dataToSave = this.fromDataObjToAOO(data.entries.map(e => e.data));
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
            _.forEach(this.currentHeaders, ((header) => {
                row.push(dataRow[header]);
            }));
            dataToSave.push(row);
        }));

        return dataToSave;
    }

    private addValidatedDataToWorkbook(originalWorkSheet: IWorkSheet, workbook: any, dataToSave: any) {

        const validSheetName = originalWorkSheet.validSheetName;
        const oriDataLength = originalWorkSheet.oriDataLength;
        const searchTerm = 'Ihre Probe-';
        const sheet = workbook.sheet(validSheetName);

        if (sheet) {
            const result = sheet.find(searchTerm);
            if (result.length > 0) {
                const cell = result[0];
                const rowNumber = cell.row().rowNumber();

                for (let i = (rowNumber + 1); i <= (rowNumber + oriDataLength); i++) {
                    for (let j = 1; j <= this.currentHeaders.length; j++) {
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
