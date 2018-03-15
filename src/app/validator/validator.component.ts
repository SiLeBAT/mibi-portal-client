import { Component, OnInit, ViewChild } from '@angular/core';
import * as Handsontable from 'handsontable';
import 'tooltipster';
import { HotTableComponent } from 'ng2-handsontable';

import { UploadService } from './../services/upload.service';
import { IKnimeOrigdata, IKnimeColHeaders, IKnimeData } from './../upload/upload.component';
import { oriHeaders } from './../services/excel-to-json.service';
import { ITableStructureProvider, ITableData, IErrRow } from './../services/json-to-table';

// FIXME
// import * as data from './../../../playground/utils/jsonOutput/out.postman.v14.test.json';


@Component({
  selector: 'app-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.css']
})
export class ValidatorComponent implements OnInit {

  // errors = data['outputValues']['json-output-4']['errors'];
  // origdata = data['outputValues']['json-output-4']['origdata'];
  // errors = this.uploadService.currentJsonResponse['outputValues']['json-output-4']['errors'];
  // origdata = this.uploadService.currentJsonResponse['outputValues']['json-output-4']['origdata'];

  tableStructureProvider: ITableStructureProvider = this.uploadService.getCurrentTableStructureProvider();
  tableStructure: ITableData = this.tableStructureProvider.getTableData();
  errData: IErrRow = this.tableStructure.errData;
  origdata: IKnimeOrigdata = this.tableStructure.origdata;

  data: IKnimeData[];
  colHeaders: string[];
  columns: string[];
  options: any;


  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    this.data = this.origdata['data'];
    let headers: string[] = this.origdata['colHeaders'];
    console.log('headers size: ', headers.length);

    this.colHeaders = headers.length === 18 ?
                        oriHeaders.filter(item => !item.startsWith('VVVO')) :
                        oriHeaders;

    this.options = {
      data: this.data,
      colHeaders: this.colHeaders,
      stretchH: 'all',
      colWidths : [ 50 ],
      autoWrapRow : true,
      comments: true,
      debug: true,
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

  afterChange(event: any) { }
}

