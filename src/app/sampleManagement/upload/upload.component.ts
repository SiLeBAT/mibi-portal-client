import { Component, OnInit } from '@angular/core';
import { HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AlertService } from '../../shared/services/alert.service';
import { ExcelToJsonService, IExcelData } from '../../shared/services/excel-to-json.service';

import { LoadingSpinnerService } from '../../shared/services/loading-spinner.service';
import { SampleStore } from '../services/sample-store.service';
import { ValidationService } from '../services/validation.service';
import { IAnnotatedSampleData } from '../models/sample-management.model';

export interface IKnimeOrigdata {
    colHeaders: Array<string>;
    data: Record<string, string>[];
}

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

    sendableFormData: FormData; // populated via ngfFormData directive
    progress: number;
    httpEvent: HttpEvent<Event>;
    httpEmitter: Subscription;
    files: File[] = [];
    file: File;
    dropDisabled = false;
    private onUploadSpinner = 'uploadSpinner';
    private _lastInvalids: any[] = [];
    maxFileSize = 2097152;

    constructor(
        private excelToJsonService: ExcelToJsonService,
        private validationService: ValidationService,
        private alertService: AlertService,
        private router: Router,
        private spinnerService: LoadingSpinnerService,
        private sampleStore: SampleStore) { }

    get lastInvalids(): any[] {
        return this._lastInvalids;
    }

    set lastInvalids(val: any[]) {
        this._lastInvalids = val;
        if (val && val[0]) {
            switch (val[0].type) {
                case 'fileSize':
                    this.alertService.error('Zu grosse Datei: Dateien müssen kleiner als 2 Mb sein.', false);
                    break;
                case 'accept':
                    this.alertService.error('Falscher Dateityp: Dateien müssen vom Typ .xlsx sein.', true);
                    break;
                default:
                    this.alertService.error('Die Datei konnte nicht hochgeladen werden.', false);
            }

        } else {
            this.alertService.clear().catch(() => {
                throw new Error('Unable to clear alert.');
            });
        }
    }

    async readFileAndValidate() {
        this.spinnerService.show(this.onUploadSpinner);
        const excelData: IExcelData = await this.excelToJsonService.convertExcelToJSJson(this.file).then(
            (uploadedData: IExcelData) => {
                return uploadedData;
            }
        );
        this.sampleStore.setState({
            entries: excelData.data.data.map(e => ({
                data: e,
                errors: {},
                corrections: []
            })),
            workSheet: excelData.workSheet
        });
        const data: Record<string, string>[] = this.sampleStore.state.entries.map(e => e.data);

        if (data) {
            this.validationService.validate(data).then(
                (validationResponse: IAnnotatedSampleData[]) => {
                    const newState = { ...this.sampleStore.state, ...{ entries: validationResponse } };
                    this.sampleStore.setState(
                        newState
                    );
                    this.router.navigate(['/samples']).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                    this.spinnerService.hide(this.onUploadSpinner);
                }
            ).catch(
                err => { throw err; }
            );
        }
    }

    isUploadSpinnerShowing() {
        return this.spinnerService.isShowing(this.onUploadSpinner);
    }

    invokeValidation() {
        this.readFileAndValidate().catch(() => {
            throw new Error('Unable to invoke validation.');
        });
    }

    trashFile() {
        this.progress = 0;
        this.files = [];
    }

    ngOnInit() { }
}
