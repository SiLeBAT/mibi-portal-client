import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { IExcelFileBlob, ExcelConverterService } from './excel-converter.service';
import { ISampleSheet } from '../models/models';

interface IExportService {
    export(sampleSheet: ISampleSheet): Promise<void>;
}

@Injectable({
    providedIn: 'root'
})
export class ExportService implements IExportService {

    constructor(private excelConverterService: ExcelConverterService) {
    }

    export(sampleSheet: ISampleSheet) {
        return this.excelConverterService.convertToExcel(sampleSheet).then(
            (excelFileBlob: IExcelFileBlob) => saveAs(excelFileBlob.blob, excelFileBlob.fileName)
        ).catch(
            err => { throw err; }
        );

    }
}
