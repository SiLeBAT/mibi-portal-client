import { Injectable } from '@angular/core';
import { WorkBook, WorkSheet, read, utils, writeFile } from 'xlsx';

import { AlertService } from '../auth/services/alert.service';
import { JsonToExcelService } from './json-to-excel.service';

type AOO = any[];


export interface ISampleDTO {
  sample_id: string;
  sample_id_avv: string;
  pathogen_adv: string;
  pathogen_text: string;
  sampling_date: string;
  isolation_date: string;
  sampling_location_adv: string;
  sampling_location_zip: string;
  sampling_location_text: string;
  topic_adv: string;
  matrix_adv: string;
  matrix_text: string;
  process_state: string;
  sampling_reason_adv: string;
  sampling_reason_text: string;
  operations_mode_adv: string;
  operations_mode_text: string;
  vvvo?: string;
  comment: string;
}

export interface ISampleCollectionDTO {
  data: ISampleDTO[];
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
  'process_state',
  'sampling_reason_adv',
  'sampling_reason_text',
  'operations_mode_adv',
  'operations_mode_text',
  'vvvo',
  'comment'
];

export const oriHeaders: string[] = [
  "Ihre<br>Proben-<br>ummer",
  "Probe-<br>nummer<br>nach<br>AVVData",
  "Erreger<br>(Text aus<br>ADV-Kat-Nr.16)",
  "Erreger<br>(Textfeld/<br>Ergänzung)",
  "Datum der<br>Probenahme",
  "Datum der<br>Isolierung",
  "Ort der<br>Probe-<br>nahme<br>(Code aus<br>ADV-Kat-<br>Nr.9)",
  "Ort der<br>Probe-<br>nahme<br>(PLZ)",
  "Ort der<br>Probe-<br>nahme<br>(Text)",
  "Oberbe-<br>griff<br>(Kodier-<br>system)<br>der<br>Matrizes<br>(Code aus<br>ADV-Kat-<br>Nr.2)",
  "Matrix<br>Code<br>(Code<br>aus<br>ADV-<br>Kat-<br>Nr.3)",
  "Matrix<br>(Textfeld/<br>Ergänzung)",
  "Ver-<br>arbeitungs-<br>zustand<br>(Code aus<br>ADV-Kat-<br>Nr.12)",
  "Grund<br>der<br>Probe-<br>nahme<br>(Code<br>aus<br>ADV-Kat-<br>Nr.4)",
  "Grund der<br>Probe-<br>nahme<br>(Textfeld/<br>Ergänzung)",
  "Betriebsart<br>(Code aus<br>ADV-Kat-Nr.8)",
  "Betriebsart<br>(Textfeld/<br>Ergänzung)",
  "VVVO-Nr /<br>Herde",
  "Bemerkung<br>(u.a.<br>Untersuchungs-<br>programm)"
];

export interface IWorkSheet {
  workSheet: WorkSheet;
  isVersion14: boolean;
}



@Injectable()
export class ExcelToJsonService {

  constructor(private alertService: AlertService,
              private jsonToExcelService: JsonToExcelService) { }

  async convertExcelToJSJson(file: File): Promise<ISampleCollectionDTO> {
    let sampleSheet: WorkSheet;
    let data: ISampleCollectionDTO;
    try {
      sampleSheet = await this.fromFileToWorkSheet(file);
      let currentWorkSheet: IWorkSheet = {
        workSheet: sampleSheet,
        isVersion14: this.isVersion14(sampleSheet)
      };
      this.jsonToExcelService.setCurrentWorkSheet(currentWorkSheet);
      data = this.fromWorksheetToData(sampleSheet);

      return data;

    } catch (err) {
      const errMessage: string = 'error reading excel file';
      this.alertService.error(errMessage, true);
    }
  }


  async fromFileToWorkSheet(excelFile: File): Promise<WorkSheet> {
    const validSheetName = 'Einsendeformular';

    return new Promise<WorkSheet>((resolve, reject) => {
      var fileReader = new FileReader();

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
        if (worksheetName === validSheetName) {
          resolve(sampleSheet);
        } else {
          reject(`not a valid excel sheet, name of first sheet must be ${validSheetName}` );
        }
      };

      fileReader.readAsBinaryString(excelFile);
    });
  }

  fromWorksheetToData(workSheet: WorkSheet): ISampleCollectionDTO {

    let data: AOO;
    let lineNumber: number = this.getVersionDependentLine(workSheet);
    if (this.isVersion14(workSheet)) {
      data = utils.sheet_to_json(workSheet, {
        header: jsHeaders,
        range: lineNumber,
        defval: '',
        dateNF:'dd"."mm"."yyyy'
      });
    } else {
      data = utils.sheet_to_json(workSheet, {
        header: jsHeaders.filter(item => item !== 'vvvo'),
        range: this.getVersionDependentLine(workSheet),
        defval: '',
        dateNF:'dd"."mm"."yyyy'
      });
    }

    const cleanedSamples = this.fromDataToCleanedSamples(data);
    let samples: ISampleDTO[] = cleanedSamples;
    let sampleCollectionDTO: ISampleCollectionDTO = {
      data: samples
    };

    return sampleCollectionDTO;
  }


  isVersion14(workSheet: WorkSheet): boolean {
    const cellAdress = 'B3';
    const cell = workSheet[cellAdress];

    return (cell !== undefined);
  }

  getVersionDependentLine(workSheet: WorkSheet): number {
    return (this.isVersion14(workSheet) ? 41 : 39);
  }

  fromDataToCleanedSamples(data: AOO): AOO {
    const cleanedData: AOO = data
      .filter(sampleObj => (Object.keys(sampleObj)
                                  .map(key => sampleObj[key]))
      .filter(item => item !== "")
      .length > 0);

    return cleanedData;
  }

}



