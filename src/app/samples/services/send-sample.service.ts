import { Injectable } from '@angular/core';
import { ExcelFileBlob, SampleSheet } from '../model/sample-management.model';
import { ExcelConverterService } from './excel-converter.service';
import { DataService } from '../../core/services/data.service';
import { User } from '../../user/model/user.model';

@Injectable({
    providedIn: 'root'
})
export class SendSampleService {

    constructor(
        private excelConverter: ExcelConverterService,
        private httpFacade: DataService) { }

    async sendData(sampleSheet: SampleSheet, fileNameAddon: string, currentUser: User, recipient: string) {
        const excelFileBlob = await this.excelConverter.convertToExcel(sampleSheet, fileNameAddon);
        const formData = this.assembleForm(excelFileBlob, currentUser, recipient);
        return this.httpFacade.sendSampleSheet(formData);

    }

    private assembleForm(excelFileBlob: ExcelFileBlob, currentUser: User, recipient: string) {
        const formData: FormData = new FormData();

        formData.append('myMemoryXSLX', excelFileBlob.blob, excelFileBlob.fileName);
        formData.append('firstName', currentUser.firstName || '');
        formData.append('lastName', currentUser.lastName || '');
        formData.append('email', currentUser.email);
        formData.append('institution', currentUser.institution.name1);
        formData.append('location', currentUser.institution.name2);
        formData.append('recipient', recipient);
        return formData;
    }
}
