import { Injectable } from '@angular/core';
import { WorkBook, WorkSheet, read, utils } from 'xlsx';

import { AlertService } from '../../core/services/alert.service';
import { IWorkSheet, SampleData } from '../model/sample-management.model';

export type AOO = any[];

// FIXME: Remove
export interface IOLDSampleCollectionDTO {
    data: SampleData[];
}

export const jsHeaders: string[] = [
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

export interface IExcelData {
    data: IOLDSampleCollectionDTO;
    workSheet: IWorkSheet;
}

@Injectable({
    providedIn: 'root'
})
export class ExcelToJsonService {
    private validSheetName: string = 'Einsendeformular';

    constructor(private alertService: AlertService) { }

    async convertExcelToJSJson(file: File): Promise<IExcelData> {
        let sampleSheet: WorkSheet;
        let data: IOLDSampleCollectionDTO;
        try {
            sampleSheet = await this.fromFileToWorkSheet(file);
            data = this.fromWorksheetToData(sampleSheet);
            const currentWorkSheet: IWorkSheet = {
                workSheet: sampleSheet,
                isVersion14: this.isVersion14(sampleSheet),
                file: file,
                oriDataLength: data.data.length,
                validSheetName: this.validSheetName
            };

            return {
                data: data,
                workSheet: currentWorkSheet
            };

        } catch (err) {
            const errMessage: string = 'error reading excel file';
            this.alertService.error(errMessage, false);
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
                if (worksheetName === this.validSheetName) {
                    resolve(sampleSheet);
                } else {
                    reject(`not a valid excel sheet, name of first sheet must be ${this.validSheetName}`);
                }
            };

            fileReader.readAsBinaryString(excelFile);
        });
    }

    private fromWorksheetToData(workSheet: WorkSheet): IOLDSampleCollectionDTO {

        let data: AOO;
        const lineNumber: number = this.getVersionDependentLine(workSheet);
        if (this.isVersion14(workSheet)) {
            data = utils.sheet_to_json(workSheet, {
                header: jsHeaders,
                range: lineNumber,
                defval: '',
                dateNF: 'dd"."mm"."yyyy'
            });
        } else {
            data = utils.sheet_to_json(workSheet, {
                header: jsHeaders.filter(item => item !== 'vvvo'),
                range: this.getVersionDependentLine(workSheet),
                defval: '',
                dateNF: 'dd"."mm"."yyyy'
            });
        }

        const cleanedSamples = this.fromDataToCleanedSamples(data);
        const samples: SampleData[] = cleanedSamples;
        const sampleCollectionDTO: IOLDSampleCollectionDTO = {
            data: samples
        };

        return sampleCollectionDTO;
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
