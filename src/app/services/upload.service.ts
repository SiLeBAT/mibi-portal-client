import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpRequest } from '@angular/common/http';

import { ITableStructureProvider } from './json-to-table';

@Injectable()
export class UploadService {
    tableStructureProvider: ITableStructureProvider | undefined;

    constructor(private httpClient: HttpClient,
        private router: Router) { }

    uploadFile(sendableFormData: FormData) {
        const postUrl = 'api/v1/upload';
        const req = new HttpRequest('POST', postUrl, sendableFormData, {
            reportProgress: true
        });

        return this.httpClient.request(req);
    }

    onUpload() {
        this.router.navigate(['/upload']).catch(() => {
            throw new Error('Unable to navigate.');
        });

    }

    setCurrentTableStructureProvider(
        tableStructureProvider: ITableStructureProvider | undefined
    ) {
        this.tableStructureProvider = tableStructureProvider;
    }

    getCurrentTableStructureProvider(): ITableStructureProvider | undefined {
        return this.tableStructureProvider;
    }

    isValidationActive() {
        return this.tableStructureProvider !== undefined;
    }
}
