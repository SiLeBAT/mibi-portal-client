import { IKnimeResponseDTO, IKnimeOrigdata, IJsResponseDTO, IKnimeData } from '../upload/upload.component';
import { jsHeaders } from './../services/excel-to-json.service';

import * as _ from 'lodash';


interface IStatusComments {
  [status: number]: string[];
}

interface IErrCol {
  [errCol: number]: IStatusComments;
}

export interface IErrRow {
  [errRow: number]: IErrCol;
}

export interface ITableData {
  origdata: IKnimeOrigdata;
  errData: IErrRow;
}

export interface ITableStructureProvider {
  data: (IKnimeResponseDTO | IJsResponseDTO[]);
  getTableData(): ITableData;
}


export class JsToTable implements ITableStructureProvider {
  constructor(public data: IJsResponseDTO[]) {}

  getTableData(): ITableData {
    let headerNum = Object.keys(this.data[0]['data']).length;
    let colHeaders = headerNum === 18 ? jsHeaders.filter(item => item !== 'vvvo') : jsHeaders;
    let data: IKnimeData[] = [];
    let errData: IErrRow = {};
    let errors = [];

    _.forEach(this.data, (item, i) => {
      data[i] = item['data'];
      errors[i] = item['errors'];
    });

    let origdata: IKnimeOrigdata = {
      colHeaders: colHeaders,
      data: data
    };

    _.forEach(errors, (error, i) => {
      let row = i;
      let errRow: IErrCol = {};
      _.forEach(error, (errList, colName) => {
        let col = _.findIndex(colHeaders, (header) => header === colName);
        let errCol: IStatusComments = {};
        _.forEach(errList, (errItem) => {
          let currentLevel = errItem['level'];
          let commentList;
          if (errCol[currentLevel] === undefined) {
            commentList = [];
            errCol[currentLevel] = commentList;
          } else {
            commentList = errCol[currentLevel];
          }
          commentList.push(errItem['message']);
        });
        errRow[col] = errCol;
      });
      errData[row] = errRow;
    });

    let tableData: ITableData = {
      origdata: origdata,
      errData: errData
    }

    return tableData;
  }
}


export class KnimeToTable implements ITableStructureProvider {

  constructor(public data: IKnimeResponseDTO) {}

  getTableData(): ITableData {
    let origdata: IKnimeOrigdata = this.data.origdata;

    let errData: IErrRow = {};
    let errors = this.data.errordata;

    for (const currentError of errors) {
      let errRow = currentError['Zeile'];
      if (errRow !== null) {
        errRow -= 1;
        let errCols;
        if (errData[errRow] === undefined) {
          errCols = {};
          errData[errRow] = errCols;
        } else {
          errCols = errData[errRow];
        }
        const cols = currentError['Spalte'];
        if (cols !== null) {
          const entries = cols.split(';');
          for (let errColumn of entries) {
            let errCol: number = Number(errColumn);
            errCol -= 1;
            let errObj;
            if (errCols[errCol] === undefined) {
              errObj = {};
              errCols[errCol] = errObj;
            } else {
              errObj = errCols[errCol];
            }

            let commentList;
            let status = currentError['Status'];
            if (errObj[status] === undefined) {
              commentList = [];
              errObj[status] = commentList;
            } else {
              commentList = errObj[status];
            }
            commentList.push(currentError['Kommentar']);
          }
        }
      }
    }

    let tableData: ITableData = {
      origdata: origdata,
      errData: errData
    }

    return tableData;
  }
}

