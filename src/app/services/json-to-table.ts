import { IKnimeResponseDTO, IKnimeOrigdata, IJsResponseDTO } from '../upload/upload.component';
import { jsHeaders } from './excel-to-json.service';

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
    data: any;
    getTableData(): ITableData;
}

export class JsToTable implements ITableStructureProvider {
    constructor(public data: IJsResponseDTO[]) { }

    getTableData(): ITableData {
        const headerNum = Object.keys(this.data[0]['data']).length;
        const colHeaders = headerNum === 18 ? jsHeaders.filter(item => item !== 'vvvo') : jsHeaders;
        const data: any[] = [];
        const errors: any[] = [];

        _.forEach(this.data, (item, i) => {
            data[i] = item['data'];
            errors[i] = item['errors'];
        });

        const origdata: IKnimeOrigdata = {
            colHeaders: colHeaders,
            data: data
        };

        const errData: IErrRow = {};

        _.forEach(errors, (error, i) => {
            const row = i;
            const errRow: IErrCol = {};
            _.forEach(error, (errList, colName) => {
                const col = _.findIndex(colHeaders, (header) => header === colName);
                const errCol: IStatusComments = {};
                _.forEach(errList, (errItem) => {
                    const currentLevel = errItem['level'];
                    let commentList: any[];
                    if (!errCol[currentLevel]) {
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

        const tableData: ITableData = {
            origdata: origdata,
            errData: errData
        };

        return tableData;
    }
}

export class KnimeToTable implements ITableStructureProvider {

    constructor(public data: IKnimeResponseDTO) { }

    getTableData(): ITableData {
        const origdata: IKnimeOrigdata = this.data.origdata;

        const errData: IErrRow = {};
        const errors = this.data.errordata;

        for (const currentError of errors) {
            let errRow = currentError['Zeile'];
            if (errRow) {
                errRow -= 1;
                let errCols;
                if (!errData[errRow]) {
                    errCols = {};
                    errData[errRow] = errCols;
                } else {
                    errCols = errData[errRow];
                }
                const cols = currentError['Spalte'];
                if (cols) {
                    const entries = cols.split(';');
                    for (const errColumn of entries) {
                        let errCol: number = Number(errColumn);
                        errCol -= 1;
                        let errObj;
                        if (!errCols[errCol]) {
                            errObj = {};
                            errCols[errCol] = errObj;
                        } else {
                            errObj = errCols[errCol];
                        }

                        let commentList: any[];
                        const status = currentError['Status'];
                        if (!errObj[status]) {
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

        const tableData: ITableData = {
            origdata: origdata,
            errData: errData
        };

        return tableData;
    }
}
