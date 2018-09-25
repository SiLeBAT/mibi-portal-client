import { Injectable } from '@angular/core';

import { WorkBook, WorkSheet, read, utils, writeFile } from 'xlsx';
import * as _ from 'lodash';
import * as XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { saveAs } from 'file-saver/FileSaver';

import { IKnimeData } from '../upload/upload.component';
import { IWorkSheet, IExcelData, jsHeaders, AOO } from './excel-to-json.service';
import { WindowRefService } from './../services/window-ref.service';


export interface IBlobData {
  blob: Blob;
  fileName: string;
}


@Injectable()
export class JsonToExcelService {
  private currentExcelData: IExcelData;
  private _window: Window;

  constructor(windowRef: WindowRefService) {
      this._window = windowRef.nativeWindow;
    }

  setCurrentExcelData(currentExcelData: IExcelData) {
    this.currentExcelData = currentExcelData;
  }


  async saveAsExcel(data: IKnimeData[], doDownload: boolean): Promise<IBlobData> {
    let blobData: IBlobData = await this.convertToExcel(data, doDownload);
    return blobData;
  }


  private async convertToExcel(data: IKnimeData[], doDownload: boolean): Promise<IBlobData> {
    let file: File = this.currentExcelData.workSheet.file;
    let oriFileName = file.name;
    let entries: string[] = oriFileName.split('.xlsx');
    let fileName: string = '';
    if (entries.length > 0) {
      fileName += entries[0];
    }
    fileName += '_validated.xlsx';

    let currentHeaders = [];
    if(this.currentExcelData.workSheet.isVersion14) {
      currentHeaders = jsHeaders;
    } else {
      currentHeaders = jsHeaders.filter(item => item !== 'vvvo');
    }

    let dataToSave: AOO = this.fromDataObjToAOO(data, currentHeaders);
    let workbook = await this.fromFileToWorkbook(file);
    this.addValidatedDataToWorkbook(workbook, dataToSave, currentHeaders);

    let blob = await this.fromWorkBookToBlob(workbook);

    if (doDownload) {
      saveAs(blob, fileName);
    }


    let blobData: IBlobData = {
      blob: blob,
      fileName: fileName
    };

    return blobData;
  }


  private fromDataObjToAOO(data, currentHeaders): AOO {
    let dataToSave: AOO = [];

    _.forEach(data, ((dataRow) => {
      let row = [];
      _.forEach(currentHeaders, ((header) => {
        row.push(dataRow[header]);
      }));
      dataToSave.push(row);
    }));

    return dataToSave;
  }


  private async fromFileToWorkbook(file: File) {
    this._window['IQc'] = { entity: 'x', ENTITIES: { x: 'x' } };
    let workbook = await XlsxPopulate.fromDataAsync(file);

    return workbook;
  }

  private addValidatedDataToWorkbook(workbook, dataToSave: AOO, currentHeaders) {
    let validSheetName = this.currentExcelData.workSheet.validSheetName;
    let oriDataLength = this.currentExcelData.workSheet.oriDataLength;
    let searchTerm = 'Ihre Probe-';
    let sheet = workbook.sheet(validSheetName);

    if (sheet) {
      let result = sheet.find(searchTerm);
      if (result.length > 0) {
        let cell = result[0];
        let rowNumber = cell.row().rowNumber();

        for (let i = (rowNumber + 1); i <= (rowNumber + oriDataLength); i++) {
          for (let j = 1; j <= currentHeaders.length; j++) {
            const cell = sheet.row(i).cell(j);
            cell.value(undefined);
          }
        }

        let startCell = 'A' + (rowNumber + 1);
        sheet.cell(startCell).value(dataToSave);
      }
    }
  }

  private async fromWorkBookToBlob(workbook) {
    let blob = await workbook.outputAsync();
    return blob;
  }

}
