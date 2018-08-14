import * as _ from 'lodash';
import { IAutoCorrectionDTO, IErrorResponseDTO, IKnimeOrigdata, IValidationResponseDTO } from '../upload/upload.component';
import { ISampleDTO, jsHeaders } from './excel-to-json.service';

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
    constructor(public data: IValidationResponseDTO[]) { }

    getTableData(): ITableData {
        const headerNum = Object.keys(this.data[0]['data']).length;
        const colHeaders = headerNum === 18 ? jsHeaders.filter(item => item !== 'vvvo') : jsHeaders;
        const data: ISampleDTO[] = [];
        const errors: IErrorResponseDTO[] = [];
        const corrections: IAutoCorrectionDTO[][] = [];

        _.forEach(this.data, (item, i) => {
            data[i] = item['data'];
            errors[i] = item['errors'];
            corrections[i] = item['corrections'];
        });

        const origdata: IKnimeOrigdata = {
            colHeaders: colHeaders,
            data: data
        };

        const errData: IErrRow = {};

        _.forEach(errors, (error, row) => {
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

        const numbersOnly = new RegExp(/^\d+?/);
        _.forEach(corrections, (correct, row) => {
            _.forEach(correct, (correctedEntry, colName: number) => {
                const colIndex = this.getColumnIndexForProperty(correctedEntry.field);
                if (!errData[row][colIndex]) {
                    errData[row][colIndex] = {};
                }
                let message =
                    `Erreger erkannt. Ursprünglicher Text ${correctedEntry.original} wurde durch den Text aus ADV-Katalog Nr. 16 ersetzt.`;
                if (numbersOnly.test(correctedEntry.original)) {
                    message =
                    // tslint:disable-next-line
                    `ADV-16-Code ${correctedEntry.original} wurde erkannt & durch den entsprechenden ADV-Text ${correctedEntry.corrected} ersetzt.`;
                }
                errData[row][colIndex][4] = [
                    message
                ];
            });

        });

        const tableData: ITableData = {
            origdata: origdata,
            errData: errData
        };

        return tableData;
    }

    private getColumnIndexForProperty(prop: string): number {

        const colMap: { [key: string]: number } = {
            pathogen_adv: 2
        };

        return colMap[prop];
    }
}
