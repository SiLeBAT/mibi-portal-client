import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { UploadService } from '../services/upload.service';
import { concat } from 'rxjs/operators/concat';
import { AlertService } from '../auth/services/alert.service';
import { ExcelToJsonService, ISampleCollectionDTO, ISampleDTO } from '../services/excel-to-json.service';
import { ValidateService } from '../services/validate.service';

import { KnimeToTable, ITableStructureProvider, JsToTable } from './../services/json-to-table';


interface IKnimeError {
  Status: number;
  Zeile: number;
  Spalte: string;
  'Fehler-Nr': number | null;
  Kommentar: string
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

export interface IKnimeData {
  'Ihre_Probenummer': string | null;
  'Probenummer_nach_AVVData': string | null;
  'Erreger_Vorbefund_Text_aus_ADV-Kat-Nr16': string | null;
  'Vorbefund_Textfeld_Ergaenzung': string | null;
  'Datum_der_Probenahme': string | null;
  'Datum_der_Isolierung': string | null;
  'Ort_der_Probenahme_ADV-Kat-Nr9': string | null;
  'Ort_der_Probenahme_PLZ': string | null;
  'Ort_der_Probe-nahme_Text': string | null;
  'Oberbegriff_Kodiersystem_der_Matrizes_ADV-Kat-Nr2': string | null;
  'Matrix_Code_ADV-Kat-Nr3': string | null;
  'Matrix_Textfeld_Ergaenzung': string | null;
  'Verarbeitungszustand_ADV-Kat-Nr12': string | null;
  'Grund_der_Probenahme_ADV-Kat-Nr4': string | null;
  'Grund_der_Probenahme_Textfeld': string | null;
  'Betriebsart_ADV-Kat-Nr8': string | null;
  'Betriebsart_Textfeld': string | null;
  'Bemerkung_Untersuchungsprogramm': string | null;
}

export interface IKnimeOrigdata {
  colHeaders: Array<string>;
  data: IKnimeData[];
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

interface IErrorResponseDTO {
  [key: string]: IErrorDTO[];
}

export interface IJsResponseDTO {
  data: ISampleDTO;
  errors: IErrorResponseDTO;
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


  constructor(private uploadService: UploadService,
              private excelToJsonService: ExcelToJsonService,
              private validateService: ValidateService,
              private alertService: AlertService,
              private router: Router) {}

  // Kinme validation:

  // uploadFileAndValidate(files: File[]) {
  //   this.uploadService.uploadFile(this.sendableFormData)
  //     .subscribe((event: HttpEvent<Event>) => {
  //       if (event.type === HttpEventType.UploadProgress) {
  //         this.progress = Math.round(100 * event.loaded / event.total);
  //       } else if (event instanceof HttpResponse) {
  //         this.files = [];
  //         const message = event['body']['title'];
  //         this.alertService.success(message, true);
  //         let responseDTO: IKnimeResponseDTO = this.fromKnimeToResponseDTO(event);
  //         this.setCurrentKnimeResponseDTO(responseDTO);
  //         this.router.navigate(['/validate']);
  //       }
  //     }, (err: HttpErrorResponse) => {
  //       console.log('error upload file, err: ', err);
  //       const errMessage = err['error']['title'];
  //       this.alertService.error(errMessage, true);
  //       this.files = [];
  //     });
  // }

  async readFileAndValidate() {
    const data: ISampleCollectionDTO = await this.excelToJsonService.convertExcelToJSJson(this.file);

    if (data) {
      this.validateService.validateJs(data)
      .subscribe((data: IJsResponseDTO[]) => {
        this.setCurrentJsResponseDTO(data);
        this.router.navigate(['/validate']);
      }, (err: HttpErrorResponse) => {
        const errMessage = err['error']['title'];
        this.alertService.error(errMessage, true);
        this.files = [];
      });
    }
  }

  invokeValidation() {
    console.log('invokeValidation executed');
    this.readFileAndValidate();
  }

  fileOverDropZone(event) {
    this.progress = 0;
    if (this.files.length > 0) {
      this.files.shift();
    }
  }

  trashFile() {
    this.progress = 0;
    this.files = [];
  }

  ngOnInit() { }

  setCurrentKnimeResponseDTO(responseDTO: IKnimeResponseDTO) {
    let knimeToTable: ITableStructureProvider = new KnimeToTable(responseDTO);
    this.uploadService.setCurrentTableStructureProvider(knimeToTable);
  }

  setCurrentJsResponseDTO(responseDTO: IJsResponseDTO[]) {
    let jsToTable: ITableStructureProvider = new JsToTable(responseDTO);
    this.uploadService.setCurrentTableStructureProvider(jsToTable);
  }

  fromKnimeToResponseDTO(dto: HttpEvent<Event>): IKnimeResponseDTO {
    let responseData = JSON.parse(dto['body']['obj']);
    let errors = responseData['outputValues']['json-output-4']['errors'];
    let origdata = responseData['outputValues']['json-output-4']['origdata'];
    let colHeaders: IKnimeColHeaders = origdata['colHeaders'];
    let knimeData: IKnimeData[] = origdata['data'];
    let knimeOrigdata: IKnimeOrigdata = {
      colHeaders: colHeaders,
      data: knimeData
    };
    let errordata: IKnimeError[] = errors['data'];

    let knimeResponseDTO: IKnimeResponseDTO = {
      errordata: errordata,
      origdata: knimeOrigdata
    };

    return knimeResponseDTO;
  }
}


