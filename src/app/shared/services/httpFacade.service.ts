import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HttpFacadeService {

    private URL = {
        sendFile: 'api/v1/job',
        validateSample: '/api/v1/upload'
    };

    constructor(private httpClient: HttpClient) {
    }

    sendSampleSheet(sendableFormData: FormData) {
        return this.postFormData(this.URL.sendFile, sendableFormData);
    }

    validateSampleData(data: Record<string, string>[]) {
        return this.postData(this.URL.validateSample, data);
    }

    private postFormData(url: string, sendableFormData: FormData) {
        const req = new HttpRequest('POST', url, sendableFormData, {
            reportProgress: true
        });

        return this.httpClient
            .request(req).toPromise();
    }

    private postData(url: string, data: Record<string, string>[]) {
        return this.httpClient
            .post(url, data).toPromise();
    }
}
