import { Injectable } from '@angular/core';
import { ISampleSheet, IExcelFileBlob } from '../model/sample-management.model';
import { ExcelConverterService } from './excel-converter.service';
import { DataService } from '../../core/services/data.service';
import { User } from '../../user/model/user.model';

// TODO: Actionize
@Injectable({
    providedIn: 'root'
})
export class SendSampleService {

    constructor(
        private excelConverter: ExcelConverterService,
        private httpFacade: DataService) { }

    async sendData(sampleSheet: ISampleSheet, filename: string, currentUser: User) {
        const excelFileBlob = await this.excelConverter.convertToExcel(sampleSheet, filename);
        const formData = this.assembleForm(excelFileBlob, currentUser);
        return this.httpFacade.sendSampleSheet(formData);

    }

    private assembleForm(excelFileBlob: IExcelFileBlob, currentUser: User) {
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
