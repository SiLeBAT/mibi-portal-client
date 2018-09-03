import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { SampleData } from '../../samples/model/sample-management.model';
import { Observable } from 'rxjs';
import { Institution } from '../../user/model/institution.model';

// TODO: Should we have a facade?
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

    validateSampleData(data: SampleData[]) {
        return this.postData(this.URL.validateSample, data);
    }

    getAllInstitutions(): Observable<Institution[]> {
        return (this.httpClient
            .get('api/v1/institutions') as Observable<Institution[]>);
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
