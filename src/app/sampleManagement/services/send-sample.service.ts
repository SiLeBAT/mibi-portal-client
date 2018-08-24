import { Injectable } from '@angular/core';
import { ISampleSheet } from '../models/models';
import { ExcelConverterService, IExcelFileBlob } from './excel-converter.service';
import { IUser } from '../../models/models';
import { HttpFacadeService } from '../../services/httpFacade.service';

@Injectable({
    providedIn: 'root'
})
export class SendSampleService {

    constructor(
        private excelConverter: ExcelConverterService,
        private httpFacade: HttpFacadeService) { }

    async sendData(sampleSheet: ISampleSheet, currentUser: IUser) {
        const excelFileBlob = await this.excelConverter.convertToExcel(sampleSheet);
        const formData = this.assembleForm(excelFileBlob, currentUser);
        return this.httpFacade.sendSampleSheet(formData);

    }

    private assembleForm(excelFileBlob: IExcelFileBlob, currentUser: IUser) {
        const formData: FormData = new FormData();

        formData.append('myMemoryXSLX', excelFileBlob.blob, excelFileBlob.fileName);
        formData.append('firstName', currentUser.firstName || '');
        formData.append('lastName', currentUser.lastName || '');
        formData.append('email', currentUser.email);
        formData.append('institution', currentUser.institution.name1);
        formData.append('location', currentUser.institution.name2);
        return formData;
    }
}
