import { Injectable } from '@angular/core';

import * as _ from 'lodash';
// @ts-ignore
import * as XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { saveAs } from 'file-saver';

import { IExcelData, jsHeaders, AOO, ISampleDTO } from './excel-to-json.service';
import { WindowRefService } from './../services/window-ref.service';

export interface IBlobData {
    blob: Blob;
    fileName: string;
}

@Injectable()
export class JsonToExcelService {
    private currentExcelData: IExcelData | undefined;
    private _window: any;

    constructor(windowRef: WindowRefService) {
        this._window = windowRef.nativeWindow;
    }

    setCurrentExcelData(currentExcelData: IExcelData | undefined) {
        this.currentExcelData = currentExcelData;
    }

    async saveAsExcel(data: ISampleDTO[], doDownload: boolean): Promise<IBlobData> {
        const blobData: IBlobData = await this.convertToExcel(data, doDownload);
        return blobData;
    }

    private async convertToExcel(data: ISampleDTO[], doDownload: boolean): Promise<IBlobData> {

        if (this.currentExcelData === undefined) {
            throw new Error('No Excel data available.');
        }
        const file: File = this.currentExcelData.workSheet.file;
        const oriFileName = file.name;
        const entries: string[] = oriFileName.split('.xlsx');
        let fileName: string = '';
        if (entries.length > 0) {
            fileName += entries[0];
        }
        fileName += '_validated.xlsx';

        let currentHeaders: any[] = [];
        if (this.currentExcelData.workSheet.isVersion14) {
            currentHeaders = jsHeaders;
        } else {
            currentHeaders = jsHeaders.filter(item => item !== 'vvvo');
        }

        const dataToSave: AOO = this.fromDataObjToAOO(data, currentHeaders);
        const workbook = await this.fromFileToWorkbook(file);
        this.addValidatedDataToWorkbook(workbook, dataToSave, currentHeaders);

        const blob = await this.fromWorkBookToBlob(workbook);

        if (doDownload) {
            saveAs(blob, fileName);
        }

        const blobData: IBlobData = {
            blob: blob,
            fileName: fileName
        };

        return blobData;
    }

    private fromDataObjToAOO(data: any, currentHeaders: any): AOO {
        const dataToSave: AOO = [];

        _.forEach(data, ((dataRow) => {
            const row: any[] = [];
            _.forEach(currentHeaders, ((header) => {
                row.push(dataRow[header]);
            }));
            dataToSave.push(row);
        }));

        return dataToSave;
    }

    private async fromFileToWorkbook(file: File) {
        this._window['IQc'] = { entity: 'x', ENTITIES: { x: 'x' } };
        const workbook = await XlsxPopulate.fromDataAsync(file);

        return workbook;
    }

    private addValidatedDataToWorkbook(workbook: any, dataToSave: AOO, currentHeaders: any) {
        if (this.currentExcelData === undefined) {
            throw new Error('Currently no data available');
        }
        const validSheetName = this.currentExcelData.workSheet.validSheetName;
        const oriDataLength = this.currentExcelData.workSheet.oriDataLength;
        const searchTerm = 'Ihre Probe-';
        const sheet = workbook.sheet(validSheetName);

        if (sheet) {
            const result = sheet.find(searchTerm);
            if (result.length > 0) {
                const cell = result[0];
                const rowNumber = cell.row().rowNumber();

                for (let i = (rowNumber + 1); i <= (rowNumber + oriDataLength); i++) {
                    for (let j = 1; j <= currentHeaders.length; j++) {
                        const cell2 = sheet.row(i).cell(j);
                        cell2.value(undefined);
                    }
                }

                const startCell = 'A' + (rowNumber + 1);
                sheet.cell(startCell).value(dataToSave);
            }
        }
    }

    private async fromWorkBookToBlob(workbook: any) {
        const blob = await workbook.outputAsync();
        return blob;
    }

}
