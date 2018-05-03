import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';


import * as _ from 'lodash';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import 'tooltipster';

import { UploadService } from './../services/upload.service';
import { AlertService } from '../auth/services/alert.service';
import { IKnimeOrigdata, IKnimeColHeaders, IKnimeData, IJsResponseDTO } from './../upload/upload.component';
import { oriHeaders } from './../services/excel-to-json.service';
import { ITableStructureProvider, ITableData, IErrRow, JsToTable } from './../services/json-to-table';

import { ISampleCollectionDTO } from './../services/excel-to-json.service';
import { ValidateService } from './../services/validate.service';
import { TableToJsonService } from './../services/table-to-json.service';
import { LoadingSpinnerService } from './../services/loading-spinner.service';
import { JsonToExcelService, IBlobData } from '../services/json-to-excel.service';


@Component({
  selector: 'app-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.css']
})
export class ValidatorComponent implements OnInit, OnDestroy {
  private _window: Window;
  private resizeId;

  tableStructureProvider: ITableStructureProvider;
  tableData: ITableData;
  errData: IErrRow;
  origdata: IKnimeOrigdata;

  data: IKnimeData[];
  colHeaders: string[];
  options: any;
  instance: string = 'hot';

  private onValidateSpinner = 'validationSpinner';
  subscriptions = [];
  private message: string;

  constructor(private uploadService: UploadService,
              private validateService: ValidateService,
              private tableToJsonService: TableToJsonService,
              private jsonToExcelService: JsonToExcelService,
              private alertService: AlertService,
              private router: Router,
              private spinnerService: LoadingSpinnerService,
              private hotRegisterer: HotTableRegisterer) {}


  ngOnInit() {
    this.initializeTable();

    this.subscriptions.push(this.validateService.doValidation
      .subscribe(notification => this.validate()));
    this.subscriptions.push(this.validateService.doSaveAsExcel
      .subscribe(notification => this.saveAsExcel()));
    this.subscriptions.push(this.validateService.doDownloadAndSend
      .subscribe(notification => this.downloadAndSend()));

  }

  isValidateSpinnerShowing() {
    return this.spinnerService.isShowing(this.onValidateSpinner);
  }

  initializeTable() {

    console.log('initializing table');

    this.tableStructureProvider = this.uploadService.getCurrentTableStructureProvider();
    if (this.tableStructureProvider) {
      this.tableData = this.tableStructureProvider.getTableData();
      this.errData = this.tableData.errData;
      this.origdata = this.tableData.origdata;
      this.data = this.origdata['data'];

      let headers: string[] = this.origdata['colHeaders'];

      this.colHeaders = headers.length === 18 ?
                          oriHeaders.filter(item => !item.startsWith('VVVO')) :
                          oriHeaders;

      this.options = {
        data: this.data,
        colHeaders: this.colHeaders,
        rowHeaders: true,
        stretchH: 'all',
        colWidths : [ 50 ],
        manualColumnResize : true,
        manualRowResize : true,
        renderAllRows : true,
        cells: (row, col, prop): any => {
          const cellProperties: any = {};

          if (this.errData[row]) {
            if (this.errData[row][col]) {
              cellProperties.errObj = this.errData[row][col];
              Object.assign(cellProperties, {renderer: this.cellRenderer});
            }
          }

          return cellProperties;
        }
      };
    }
  }

  cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    const yellow = 'rgb(255, 250, 205)';
    const red = 'rgb(255, 193, 193)';
    const blue = 'rgb(240, 248, 255)';
    const errObj = cellProperties.errObj;
    const tooltipOptionList = [];
    const statusList = [4, 1, 2];
    const statusMapper = {
      1: ['tooltipster-warning', 'bottom', yellow],
      2: ['tooltipster-error', 'top', red],
      4: ['tooltipster-info', 'left', blue]
    }

    Handsontable.renderers.TextRenderer.apply(this, arguments);

    for (const status of statusList) {
      if (errObj[status]) {
        td.classList.add('tooltipster-text');
        td.style.backgroundColor = statusMapper[status][2];
        const commentList = errObj[status];
        let tooltipText = '<ul>';
        for (const comment of commentList) {
          tooltipText += '<li>';
          tooltipText += comment;
          tooltipText += '</li>';
          }
        tooltipText += '</ul>';
        const theme = statusMapper[status][0];
        const side = statusMapper[status][1];
        tooltipOptionList.push({
          repositionOnScroll : true,
          animation : 'grow', // fade
          delay : 0,
          theme: theme,
          touchDevices : false,
          trigger : 'hover',
          contentAsHTML : true,
          content : tooltipText,
          side : side
        });
      }
    }

    // add multiple property to the tooltip options => set multiple: true except in first option
    if (tooltipOptionList.length > 1) {
      const optionsNum = tooltipOptionList.length;
      tooltipOptionList[1].multiple = true;
      if (optionsNum === 3) {
        tooltipOptionList[2].multiple = true;
      }
    }

    td.style.fontWeight = 'bold';

    let instances = $.tooltipster.instances(td);
    if (instances.length == 0) {
      for (const option of tooltipOptionList) {
        $(td).tooltipster(option);
      }
    }
  }

  afterChange(event: any) {}

  validate() {
    _.forEach($('.tooltipster-text'), (item) => {
      if ($.tooltipster.instances($(item)).length > 0) {
        $(item).tooltipster('destroy');
      }
    });

    let requestDTO: ISampleCollectionDTO = this.tableToJsonService.fromTableToDTO(this.data);
    this.spinnerService.show(this.onValidateSpinner);
    this.validateService.validateJs(requestDTO)
      .subscribe((data: IJsResponseDTO[]) => {
        this.setCurrentJsResponseDTO(data);
        this.spinnerService.hide(this.onValidateSpinner);
        this.initializeTable();
      }, (err: HttpErrorResponse) => {
        this.spinnerService.hide(this.onValidateSpinner);
        const errMessage = err['error']['title'];
        this.message = errMessage;
        this.alertService.error(errMessage);
      });
  }

  async saveAsExcel(): Promise<IBlobData> {
    let blobData: IBlobData;
    try {
      blobData = await this.jsonToExcelService.saveAsExcel(this.data);
    } catch (err) {
      this.message = 'Problem beim Speichern der validierten Daten als Excel';
      this.alertService.error(this.message, false);
    }

    return blobData;
  }

  async downloadAndSend() {
    let blobData: IBlobData = await this.saveAsExcel();
    try {
      let formData: FormData = new FormData();
      formData.append('myMemoryXSLX', blobData.blob, blobData.fileName);
      this.validateService.sendFile(formData)
        .subscribe((event: HttpEvent<Event>) => {
          if (event instanceof HttpResponse) {
            const message = event['statusText'];
            this.message = `Auftrag an das BfR senden ${message}`;
            this.alertService.success(this.message);
          }
        }, (err: HttpErrorResponse) => {
          const errMessage = err['error']['error'];
          this.message = errMessage;
          this.alertService.error(errMessage);
        });
    } catch (err) {
      this.message = 'Problem beim Speichern der validierten Daten als Excel';
      this.alertService.error(this.message, false);
    }

  }

  setCurrentJsResponseDTO(responseDTO: IJsResponseDTO[]) {
    let jsToTable: ITableStructureProvider = new JsToTable(responseDTO);
    this.uploadService.setCurrentTableStructureProvider(jsToTable);
  }

  hasMessage() {
    console.log('this.message: ', this.message);
    return (this.message !== undefined);
  }

  ngOnDestroy() {
    this.uploadService.setCurrentTableStructureProvider(undefined);
    this.jsonToExcelService.setCurrentExcelData(undefined);

    _.forEach(this.subscriptions, (subscription) => {
      subscription.unsubscribe();
    });
  }

}

