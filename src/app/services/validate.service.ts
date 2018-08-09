import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';

import { ISampleCollectionDTO } from './excel-to-json.service';

@Injectable()
export class ValidateService {
    doValidation: EventEmitter<any>;
    doSaveAsExcel: EventEmitter<any>;
    doSend: EventEmitter<any>;

    constructor(private httpClient: HttpClient) {
        this.doValidation = new EventEmitter();
        this.doSaveAsExcel = new EventEmitter();
        this.doSend = new EventEmitter();
    }

    validateJs(data: ISampleCollectionDTO) {
        return this.httpClient
            .post('/api/v1/upload', data.data);
    }

    sendFile(sendableFormData: FormData) {
        const postUrl = 'api/v1/job';
        const req = new HttpRequest('POST', postUrl, sendableFormData, {
            reportProgress: true
        });

        return this.httpClient
            .request(req);
    }

    onValidate() {
        this.doValidation.emit();
    }

    onSave() {
        this.doSaveAsExcel.emit();
    }

    onSend() {
        this.doSend.emit();
    }

}
