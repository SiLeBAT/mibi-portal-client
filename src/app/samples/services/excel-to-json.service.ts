import { Injectable } from '@angular/core';
import { WorkBook, WorkSheet, read, utils } from 'xlsx';
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment/locale/de';
import { ImportedExcelFileDetails, SampleData, VALID_SHEET_NAME, FORM_PROPERTIES, ExcelData } from '../model/sample-management.model';
import { ClientError } from '../../core/model/client-error';

export type AOO = any[];

// TODO: Possibly changes Store state & should be handled by actions.
@Injectable({
    providedIn: 'root'
})
export class ExcelToJsonService {

    constructor() { }

    async convertExcelToJSJson(file: File): Promise<ExcelData> {
        let sampleSheet: WorkSheet;
        let data: SampleData[];
        let nrl: string = '';
        try {
            sampleSheet = await this.fromFileToWorkSheet(file);
            data = this.fromWorksheetToData(sampleSheet);
            nrl = this.getNRLFromWorkSheet(sampleSheet);
            const currentWorkSheet: ImportedExcelFileDetails = {
                workSheet: sampleSheet,
                file: file,
                oriDataLength: data.length
            };

            return {
                data: data,
                meta: {
                    nrl
                },
                fileDetails: currentWorkSheet
            };

        } catch (err) {
            throw new ClientError('Ein Fehler ist aufgetreten beim einlesen der Datei.');
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
                    cellStyles: true,
                    cellNF: true
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

    private getNRLFromWorkSheet(workSheet: WorkSheet): string {
        const workSheetNRL: string = workSheet['B7'].v || '';
        let nrl = '';

        switch (workSheetNRL.trim()) {
            case 'NRL Überwachung von Bakterien in zweischaligen Weichtieren':
                nrl = 'NRL-Vibrio';
                break;

            case 'NRL Escherichia coli einschließlich verotoxinbildende E. coli':
            case 'NRL Verotoxinbildende Escherichia coli':
                nrl = 'NRL-VTEC';
                break;

            case 'Bacillus spp.':
            case 'Clostridium spp. (C. difficile)':
                nrl = 'Sporenbildner';
                break;
            case 'NRL koagulasepositive Staphylokokken einschließlich Staphylococcus aureus':
                nrl = 'NRL-Staph';
                break;

            case 'NRL Salmonellen (Durchführung von Analysen und Tests auf Zoonosen)':
                nrl = 'NRL-Salm';
                break;
            case 'NRL Listeria monocytogenes':
                nrl = 'NRL-Listeria';
                break;
            case 'NRL Campylobacter':
                nrl = 'NRL-Campy';
                break;
            case 'NRL Antibiotikaresistenz':
                nrl = 'NRL-AR';
                break;
            case 'Yersinia':
                nrl = 'KL-Yersinia';
                break;
            case 'NRL Trichinella':
                nrl = 'NRL-Trichinella';
                break;
            case 'NRL Überwachung von Viren in zweischaligen Weichtieren':
                nrl = 'NRL-Virus';
                break;
            case 'Leptospira':
                nrl = 'KL-Leptospira';
                break;
            default:

        }

        return nrl;
    }

    private fromWorksheetToData(workSheet: WorkSheet): SampleData[] {

        let data: AOO;
        const lineNumber: number = this.getVersionDependentLine(workSheet);
        data = utils.sheet_to_json(workSheet, {
            header: FORM_PROPERTIES,
            range: lineNumber,
            defval: ''
        });
        const cleanedData = this.fromDataToCleanedSamples(data);
        const formattedData = this.formatData(cleanedData);
        return formattedData;
    }

    private formatData(data: any) {
        const formattedData = data.map(
            (sample: SampleData) => {
                for (const props in sample) {
                    if (this.isDateField(props)) {
                        sample[props] = this.parseDate(sample[props]);
                    }
                }
                return sample;
            }
        );
        return formattedData;
    }

    private parseDate(date: string) {
        let parseOptions = {
            dateFormat: 'DD.MM.YYYY'
        };
        const americanDF = /\d\d?\/\d\d?\/\d\d\d?\d?/;
        if (americanDF.test(date)) {
            parseOptions = {
                dateFormat: 'MM/DD/YYYY'
            };
        }
        try {
            const parsedDate = moment(date, parseOptions.dateFormat).locale('de').format('DD.MM.YYYY');
            if (parsedDate === 'Invalid date') {
                return date;
            }
            return parsedDate;
        } catch (e) {
            return date;
        }
    }

    private isDateField(field: string) {
        switch (field) {
            case 'sampling_date':
            case 'isolation_date':
                return true;
            default:
                return false;
        }
    }

    private getVersionDependentLine(workSheet: WorkSheet): number {
        let num = 41;
        _.find(workSheet, (o, i) => {
            if (o.v === 'Ihre Probe-nummer') {
                const h = i.replace(/\D/, '');
                num = parseInt(h, 10);
                return true;
            }
            return false;
        });
        return num;
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
