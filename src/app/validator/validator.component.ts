import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import 'tooltipster';
import { ConfirmationService, ConfirmSettings, ResolveEmit } from "@jaspero/ng-confirmations";

import { UploadService } from '../services/upload.service';
import { AlertService } from '../auth/services/alert.service';
import { IKnimeOrigdata, IKnimeColHeaders, IKnimeData, IJsResponseDTO } from '../upload/upload.component';
import { oriHeaders } from '../services/excel-to-json.service';
import { ITableStructureProvider, ITableData, IErrRow, JsToTable } from '../services/json-to-table';

import { ISampleCollectionDTO } from '../services/excel-to-json.service';
import { ValidateService } from '../services/validate.service';
import { TableToJsonService } from '../services/table-to-json.service';
import { LoadingSpinnerService } from '../services/loading-spinner.service';
import { JsonToExcelService, IBlobData } from '../services/json-to-excel.service';
import { AuthService } from '../auth/services/auth.service';
import { CanComponentDeactivate } from '../can-deactivate/can-deactivate.guard';
import { CanReloadComponent } from '../can-deactivate/can-reload.component';


interface IWarning {
  row: number;
  col: number;
}

interface IErrorColors {
  red: boolean;
  yellow: boolean;
  blue: boolean;
  warnings: IWarning[];
}


@Component({
  selector: 'app-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.css']
})
export class ValidatorComponent extends CanReloadComponent implements OnInit, OnDestroy, CanComponentDeactivate {
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
  private dataChanged: boolean = false;
  private currentErrors: IErrorColors = {
    red: false,
    yellow: false,
    blue: false,
    warnings: []
  };
  private newWarnings: boolean = false;

  constructor(private uploadService: UploadService,
              private validateService: ValidateService,
              private tableToJsonService: TableToJsonService,
              private jsonToExcelService: JsonToExcelService,
              private alertService: AlertService,
              private router: Router,
              private authService: AuthService,
              private spinnerService: LoadingSpinnerService,
              private hotRegisterer: HotTableRegisterer,
              private confirmationService: ConfirmationService) {
    super();
  }


  ngOnInit() {
    this.initializeTable();

    this.subscriptions.push(this.validateService.doValidation
      .subscribe(notification => this.validateFromMenu()));
    this.subscriptions.push(this.validateService.doSaveAsExcel
      .subscribe(notification => this.saveAsExcel()));
    this.subscriptions.push(this.validateService.doSend
      .subscribe(notification => this.send()));
  }

  isValidateSpinnerShowing() {
    return this.spinnerService.isShowing(this.onValidateSpinner);
  }

  canReload() {
    return !this.uploadService.isValidationActive();
  }

  canDeactivate(): Promise<boolean> {
    if (this.uploadService.isValidationActive()) {
      return new Promise((resolve, reject) => {
        const options: ConfirmSettings = {
          overlay: true,
          overlayClickToClose: false,
          showCloseButton: true,
          confirmText: 'Ok',
          declineText: 'Cancel'
        }

       this.confirmationService
          .create(
            "Seite verlassen",
            `<p>Möchten Sie Ihre Daten verwerfen und die Seite verlassen?</p>`,
            options
          )
          .subscribe((ans: ResolveEmit) => {
            if (ans.resolved) {
              resolve(true);
            } else {
              reject();
            }
          });
        });
    }
    return Promise.resolve(true);
  }


  async initializeTable() {
    this.newWarnings = false;
    this.tableStructureProvider = this.uploadService.getCurrentTableStructureProvider();
    if (this.tableStructureProvider) {
      this.tableData = this.tableStructureProvider.getTableData();
      this.errData = this.tableData.errData;
      this.currentErrors = this.getErrorColors();
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

  validateFromMenu() {
    this.dataChanged = false;
    this.validate();
  }

  async validate() {
    await this.alertService.clear();

    _.forEach($('.tooltipster-text'), (item) => {
      if ($.tooltipster.instances($(item)).length > 0) {
        $(item).tooltipster('destroy');
      }
    });

    let requestDTO: ISampleCollectionDTO = this.tableToJsonService.fromTableToDTO(this.data);
    this.spinnerService.show(this.onValidateSpinner);

    try {
      const data = await this.validateService.validateJs(requestDTO).toPromise();
      this.setCurrentJsResponseDTO(data as IJsResponseDTO[]);
      this.spinnerService.hide(this.onValidateSpinner);
      this.initializeTable();
    } catch (err) {
      this.spinnerService.hide(this.onValidateSpinner);
      const errMessage = err['error']['title'];
      this.message = errMessage;
      this.alertService.error(errMessage, false);
    };
  }

  async saveAsExcel(doDownload: boolean = true): Promise<IBlobData> {
    if (this.dataChanged) {
      await this.validate();
    }

    let blobData: IBlobData;
    try {
      blobData = await this.jsonToExcelService.saveAsExcel(this.data, doDownload);
    } catch (err) {
      this.message = 'Problem beim Speichern der validierten Daten als Excel';
      this.alertService.error(this.message, false);
    }

    return blobData;
  }

  getErrorColors(): IErrorColors {
    const prevWarnings: IWarning[] = this.currentErrors.warnings;
    let curWarnings: IWarning[] = [];
    let errorColors: IErrorColors = {
      red: false,
      yellow: false,
      blue: false,
      warnings: []
    }

    _.forEach((this.errData), (rowItem, rowIndex) => {
      _.forEach((rowItem), (colItem, colIndex) => {
        if (colItem[2]) {
          errorColors.red = true;
        }
        if (colItem[1]) {
          errorColors.yellow = true;
          const curWarning: IWarning = {
            row: rowIndex,
            col: colIndex
          }
          curWarnings.push(curWarning);
          if (_.findIndex(prevWarnings, (prevWarning) =>  _.isMatch(prevWarning, curWarning)) === -1) {
            this.newWarnings = true;
          }
        }
      });
    });
    errorColors.warnings = curWarnings;

    return errorColors;
  }

  async send() {
    let blobData: IBlobData = await this.saveAsExcel(false);

    try {
      if (this.currentErrors.red) {
        this.message = 'Es gibt noch rot gekennzeichnete Fehler. Bitte vor dem Senden korrigieren.';
        this.alertService.error(this.message, false);
      } else if ((this.currentErrors.yellow) && (this.dataChanged)) {
        if (!this.newWarnings) {
          this.sendData(blobData);
        } else {
          this.message = 'Sie haben nach dem letzten Validierungsvorgang Änderungen gemacht, die zu neuen Ergebnissen führen. Wenn Sie dennoch senden wollen, dann klicken Sie bitte nochmals Senden.';
          this.alertService.error(this.message, false);
          this.dataChanged = false;
        }
      } else {
        this.sendData(blobData);
      };
    } catch (err) {
      this.message = 'Problem beim Speichern der validierten Daten als Excel';
      this.alertService.error(this.message, false);
    }
  }

  async sendData(blobData: IBlobData) {
    let formData: FormData = new FormData();
    formData.append('myMemoryXSLX', blobData.blob, blobData.fileName);

    await this.alertService.clear();

    const options: ConfirmSettings = {
      overlay: true,
      overlayClickToClose: false,
      showCloseButton: true,
      confirmText: 'Ok',
      declineText: 'Cancel'
    }

    this.confirmationService.create('Senden', `<p>Ihre Probendaten werden jetzt an das BfR gesendet.</p>
                                               <p>Bitte vergessen Sie nicht die Exceltabelle in Ihrem Mailanhang
                                               auszudrucken und Ihren Isolaten beizulegen.</p>`, options)
      .subscribe((ans: ResolveEmit) => {
        if (ans.resolved) {
          const currentUser = this.authService.getCurrentUser();
          formData.append('firstName', currentUser.firstName);
          formData.append('lastName', currentUser.lastName);
          formData.append('email', currentUser.email);
          formData.append('institution', currentUser.institution.name1);
          formData.append('location', currentUser.institution.name2);
          this.validateService.sendFile(formData)
            .subscribe((event: HttpEvent<Event>) => {
              if (event instanceof HttpResponse) {
                this.message = `Der Auftrag wurde an das BfR gesendet.
                                Bitte drucken Sie die Exceltabelle in Ihrem Mailanhang
                                aus und legen sie Ihren Isolaten bei.`;
                this.alertService.success(this.message, false);
              }
            }, (err: HttpErrorResponse) => {
              const errMessage = err['error']['error'];
              this.message = errMessage;
              this.alertService.error(errMessage, false);
            });
          } else {
          this.message = 'Es wurden keine Probendaten an das BfR gesendet';
          this.alertService.error(this.message, false);
        };
      });
  }

  setCurrentJsResponseDTO(responseDTO: IJsResponseDTO[]) {
    let jsToTable: ITableStructureProvider = new JsToTable(responseDTO);
    this.uploadService.setCurrentTableStructureProvider(jsToTable);
  }

  hasMessage() {
    return (this.message !== undefined);
  }

  afterChange(changes) {
    if (changes.params[1] === 'edit') {
      this.dataChanged = true;
    }
  }

  ngOnDestroy() {
    this.uploadService.setCurrentTableStructureProvider(undefined);
    this.jsonToExcelService.setCurrentExcelData(undefined);

    _.forEach(this.subscriptions, (subscription) => {
      subscription.unsubscribe();
    });
  }

}

