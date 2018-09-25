import { Injectable } from '@angular/core';
import { WorkBook, WorkSheet, read, utils } from 'xlsx';
import { IImportedExcelFileDetails, SampleData, VALID_SHEET_NAME, CURRENT_HEADERS, IExcelData } from '../model/sample-management.model';

export type AOO = any[];

// TODO: Possibly changes Store state & should be handled by actions.
@Injectable({
    providedIn: 'root'
})
export class ExcelToJsonService {

    constructor() { }

    async convertExcelToJSJson(file: File): Promise<IExcelData> {
        let sampleSheet: WorkSheet;
        let data: SampleData[];
        try {
            sampleSheet = await this.fromFileToWorkSheet(file);
            data = this.fromWorksheetToData(sampleSheet);
            const currentWorkSheet: IImportedExcelFileDetails = {
                workSheet: sampleSheet,
                isVersion14: this.isVersion14(sampleSheet),
                file: file,
                oriDataLength: data.length
            };

            return {
                data: data,
                workSheet: currentWorkSheet
            };

        } catch (err) {
            const errMessage: string = 'error reading excel file';
            // TODO: Fix this
            // this.alertService.error(errMessage, false);
            throw new Error(errMessage);
        }
    }

    private async fromFileToWorkSheet(excelFile: File): Promise<WorkSheet> {
        return new Promise<WorkSheet>((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onload = (event: any) => {
                const binaryStr: string = event.target.result;
                const workbook: WorkBook = read(binaryStr, {
                    type: 'binary',
                    cellDates: true,
                    cellText: false,
                    cellStyles: true
                });
                const worksheetName: string = workbook.SheetNames[0];
                const sampleSheet: WorkSheet = workbook.Sheets[worksheetName];
                if (worksheetName === VALID_SHEET_NAME) {
                    resolve(sampleSheet);
                } else {
                    reject(`not a valid excel sheet, name of first sheet must be ${VALID_SHEET_NAME}`);
                }
            };

            fileReader.readAsBinaryString(excelFile);
        });
    }

    private fromWorksheetToData(workSheet: WorkSheet): SampleData[] {

        let data: AOO;
        const lineNumber: number = this.getVersionDependentLine(workSheet);
        if (this.isVersion14(workSheet)) {
            data = utils.sheet_to_json(workSheet, {
                header: CURRENT_HEADERS,
                range: lineNumber,
                defval: '',
                dateNF: 'dd"."mm"."yyyy'
            });
        } else {
            data = utils.sheet_to_json(workSheet, {
                header: CURRENT_HEADERS.filter(item => item !== 'vvvo'),
                range: this.getVersionDependentLine(workSheet),
                defval: '',
                dateNF: 'dd"."mm"."yyyy'
            });
        }

        return this.fromDataToCleanedSamples(data);
    }

    private isVersion14(workSheet: WorkSheet): boolean {
        const cellAdress = 'B3';
        const cell = workSheet[cellAdress];

        return (cell !== undefined);
    }

    private getVersionDependentLine(workSheet: WorkSheet): number {
        return (this.isVersion14(workSheet) ? 41 : 39);
    }

    private fromDataToCleanedSamples(data: AOO): AOO {
        const cleanedData: AOO = data
            .filter(sampleObj => (Object.keys(sampleObj)
                .map(key => sampleObj[key]))
                .filter(item => item !== '')
                .length > 0);

        return cleanedData;
    }

}
