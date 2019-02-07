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

    async sendData(sampleSheet: SampleSheet, filename: string, currentUser: User, comment: string, recipient: string) {
        const excelFileBlob = await this.excelConverter.convertToExcel(sampleSheet, filename);
        const formData = this.assembleForm(excelFileBlob, currentUser, comment, recipient);
        return this.httpFacade.sendSampleSheet(formData);

    }

    private assembleForm(excelFileBlob: ExcelFileBlob, currentUser: User, comment: string, recipient: string) {
        const formData: FormData = new FormData();

        formData.append('myMemoryXSLX', excelFileBlob.blob, excelFileBlob.fileName);
        formData.append('firstName', currentUser.firstName || '');
        formData.append('lastName', currentUser.lastName || '');
        formData.append('email', currentUser.email);
        formData.append('institution', currentUser.instituteId);
        formData.append('comment', comment || '');
        formData.append('recipient', recipient || '');
        return formData;
    }
}
