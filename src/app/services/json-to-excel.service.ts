import { Injectable } from '@angular/core';

import { WorkBook, WorkSheet, read, utils, writeFile } from 'xlsx';
import * as _ from 'lodash';

import { IKnimeData } from '../upload/upload.component';
import { IWorkSheet } from './excel-to-json.service';


@Injectable()
export class JsonToExcelService {
  private currentWorkSheet: IWorkSheet;

  constructor() { }

  setCurrentWorkSheet(currentWorkSheet: IWorkSheet) {
    this.currentWorkSheet = currentWorkSheet;
  }

  saveAsExcel(data: IKnimeData[]) {
    this.convertToExcel(data);
  }

  convertToExcel(data) {
    let workSheetToSave: WorkSheet;
    if (this.currentWorkSheet.isVersion14) {
      workSheetToSave = this.getWorkSheet14ForSave(data);
    } else {
      workSheetToSave = this.getWorkSheet13ForSave(data);
    }

    let fileName = 'ProbenEinsendebogen.xlsx';
    let workBook: WorkBook = utils.book_new();
    utils.book_append_sheet(workBook, workSheetToSave, 'Einsendeformular');
    writeFile(workBook, fileName);
  }

  getWorkSheet13ForSave(data): WorkSheet {
    let workSheet = this.currentWorkSheet.workSheet;

    let dataUpper = utils.sheet_to_json(workSheet, {
      header: 1,
      range: 'A1:R36',
      defval: '',
      dateNF:'dd"."mm"."yyyy'
    });
    let dataHeader = utils.sheet_to_json(workSheet, {
      header: 1,
      range: 'A39:R39',
      defval: '',
      dateNF:'dd"."mm"."yyyy'
    });

    let wsUpper: WorkSheet = utils.json_to_sheet(dataUpper, {
      dateNF:'dd"."mm"."yyyy',
      skipHeader: true,
      cellDates: true
    });

    let wsHeader: WorkSheet = utils.sheet_add_json(wsUpper, dataHeader, {
      origin: -1,
      dateNF:'dd"."mm"."yyyy',
      skipHeader: true,
      cellDates: true
    });
    let wsToSave: WorkSheet = utils.sheet_add_json(wsHeader, data, {
      origin: -1,
      dateNF:'dd"."mm"."yyyy',
      skipHeader: true,
      cellDates: true
    });

    return wsToSave;
  }

  getWorkSheet14ForSave(data): WorkSheet {
    let workSheet = this.currentWorkSheet.workSheet;

    let dataUpper = utils.sheet_to_json(workSheet, {
      header: 1,
      range: 'A1:S41',
      defval: '',
      dateNF:'dd"."mm"."yyyy'
    });
    let wsUpper: WorkSheet = utils.json_to_sheet(dataUpper, {
      dateNF:'dd"."mm"."yyyy',
      skipHeader: true,
      cellDates: true
    });
    let wsToSave: WorkSheet = utils.sheet_add_json(wsUpper, data, {
      origin: -1,
      dateNF:'dd"."mm"."yyyy',
      skipHeader: true,
      cellDates: true
    });

    return wsToSave;
  }

}
