import { Injectable } from '@angular/core';
import { WorkBook, WorkSheet, read, utils } from 'xlsx';

import { AlertService } from '../auth/services/alert.service';

type AOO = any[];


interface ISampleDTO {
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


@Injectable()
export class ExcelToJsonService {

  constructor(private alertService: AlertService,) { }

  async convertExcelToJSJson(file: File): Promise<ISampleCollectionDTO> {
    let sampleSheet: WorkSheet;
    let data: ISampleCollectionDTO;
    try {
      sampleSheet = await this.fromFileToWorkSheet(file);
      console.log('sampleSheet: ', sampleSheet);
      data = this.fromWorksheetToData(sampleSheet);
      console.log('sampleSheet data: ', data);

      return data;

    } catch (err) {
      const errMessage: string = 'error reading excel file';
      console.log(errMessage, ': ', err);
      this.alertService.error(errMessage, true);
    }
  }


  async fromFileToWorkSheet(excelFile: File): Promise<WorkSheet> {
    const validSheetName = 'Einsendeformular';

    return new Promise<WorkSheet>((resolve, reject) => {
      var fileReader = new FileReader();

      fileReader.onload = (event: any) => {
        const binaryStr: string = event.target.result;
        const workbook: WorkBook = read(binaryStr, {type: 'binary'});
        const worksheetName: string = workbook.SheetNames[0];
        const sampleSheet: WorkSheet = workbook.Sheets[worksheetName];
        if (worksheetName === validSheetName) {
          resolve(sampleSheet);
        } else {
          reject("not a valid excel sheet");
        }
      };

      fileReader.readAsBinaryString(excelFile);
    });
  }

  fromWorksheetToData(workSheet: WorkSheet): ISampleCollectionDTO {
    const headers: string[] = [
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

    let data: AOO;
    if (this.isVersion14(workSheet)) {
      data = utils.sheet_to_json(workSheet, {
        header: headers,
        range: this.getVersionDependentLine(workSheet),
        defval: ''
      });
    } else {
      data = utils.sheet_to_json(workSheet, {
        header: headers.filter(item => item !== 'vvvo'),
        range: this.getVersionDependentLine(workSheet),
        defval: ''
      });

    }

    console.log('data: ', data);
    const cleanedSamples = this.fromDataToCleanedSamples(data);
    console.log('cleanedSamples: ', cleanedSamples);

    // let sampleDTO: ISample14DTO;
    let samples: ISampleDTO[] = cleanedSamples;

    let sampleCollectionDTO: ISampleCollectionDTO = {
      data: samples
    };

    console.log('samples: ', samples);

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
