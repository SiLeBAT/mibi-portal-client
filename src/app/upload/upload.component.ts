import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UploadService } from '../services/upload.service';
import { AlertService } from '../auth/services/alert.service';
import { ExcelToJsonService, ISampleCollectionDTO, ISampleDTO, IExcelData } from '../services/excel-to-json.service';
import { JsonToExcelService } from '../services/json-to-excel.service';
import { ValidateService } from '../services/validate.service';

import { ITableStructureProvider, JsToTable } from '../services/json-to-table';

import { LoadingSpinnerService } from '../services/loading-spinner.service';

interface IKnimeError {
    Status: number;
    Zeile: number;
    Spalte: string;
    'Fehler-Nr': number | null;
    Kommentar: string;
}

export interface IKnimeColHeaders extends Array<string> {
    'Ihre_Probenummer': string;
    'Probenummer_nach_AVVData': string;
    'Erreger_Vorbefund_Text_aus_ADV-Kat-Nr16': string;
    'Vorbefund_Textfeld_Ergaenzung': string;
    'Datum_der_Probenahme': string;
    'Datum_der_Isolierung': string;
    'Ort_der_Probenahme_ADV-Kat-Nr9': string;
    'Ort_der_Probenahme_PLZ': string;
    'Ort_der_Probe-nahme_Text': string;
    'Oberbegriff_Kodiersystem_der_Matrizes_ADV-Kat-Nr2': string;
    'Matrix_Code_ADV-Kat-Nr3': string;
    'Matrix_Textfeld_Ergaenzung': string;
    'Verarbeitungszustand_ADV-Kat-Nr12': string;
    'Grund_der_Probenahme_ADV-Kat-Nr4': string;
    'Grund_der_Probenahme_Textfeld': string;
    'Betriebsart_ADV-Kat-Nr8': string;
    'Betriebsart_Textfeld': string;
    'Bemerkung_Untersuchungsprogramm': string;
}

export interface IKnimeOrigdata {
    colHeaders: Array<string>;
    data: ISampleDTO[];
}

export interface IKnimeResponseDTO {
    errordata: IKnimeError[];
    origdata: IKnimeOrigdata;
}

interface IErrorDTO {
    code: number;
    level: number;
    message: string;
}

export interface IErrorResponseDTO {
    [key: string]: IErrorDTO[];
}

export interface IAutoCorrectionDTO {
    corrected: string;
    field: string;
    original: string;
}

export interface IValidationResponseDTO {
    data: ISampleDTO;
    errors: IErrorResponseDTO;
    corrections: IAutoCorrectionDTO[];
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

    constructor(private uploadService: UploadService,
        private excelToJsonService: ExcelToJsonService,
        private jsonToExcelService: JsonToExcelService,
        private validateService: ValidateService,
        private alertService: AlertService,
        private router: Router,
        private spinnerService: LoadingSpinnerService) { }

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
        const excelData: IExcelData = await this.excelToJsonService.convertExcelToJSJson(this.file);
        this.jsonToExcelService.setCurrentExcelData(excelData);
        const data: ISampleCollectionDTO = excelData.data;

        if (data) {
            this.spinnerService.show(this.onUploadSpinner);
            this.validateService.validateJs(data)
                .subscribe((data2: IValidationResponseDTO[]) => {
                    this.spinnerService.hide(this.onUploadSpinner);
                    const jsToTable: ITableStructureProvider = new JsToTable(data2);
                    this.uploadService.setCurrentTableStructureProvider(jsToTable);
                    this.router.navigate(['/validate']).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                }, (err: HttpErrorResponse) => {
                    const errMessage = err['error']['title'];
                    this.alertService.error(errMessage, true);
                    this.files = [];
                    this.spinnerService.hide(this.onUploadSpinner);
                });

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
