import { Component, OnInit, ViewChild } from '@angular/core';
import * as Handsontable from 'handsontable';
import 'tooltipster';
import { HotTableComponent } from 'ng2-handsontable';

// import * as data from './../../../playground/utils/jsonOutput/out.postman.v14.test.json';
import { UploadService } from './../services/upload.service';


@Component({
  selector: 'app-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.css']
})
export class ValidatorComponent implements OnInit {

  // errors = data['outputValues']['json-output-4']['errors'];
  // origdata = data['outputValues']['json-output-4']['origdata'];
  errors = this.uploadService.currentJsonResponse['outputValues']['json-output-4']['errors'];
  origdata = this.uploadService.currentJsonResponse['outputValues']['json-output-4']['origdata'];

  data: any[];
  colHeaders: string[];
  columns: any[];
  options: any;
  private errData: any;


  constructor(private uploadService: UploadService) {
  }

  ngOnInit() {

    // console.log('errors: ', this.errors);
    // console.log('errors["data"]: ', this.errors['data']);
    // console.log('origdata: ', this.origdata);

    this.data = this.origdata['data'];
    this.colHeaders = this.origdata['colHeaders'];

    // reorganize error data
    this.errData = {};

    for (const currentError of this.errors['data']) {
      // console.log('errData: ', errData);
      let errRow = currentError['Zeile'];
      if (errRow !== null) {
        errRow -= 1;
        let errCols;
        if (this.errData[errRow] === undefined) {
          errCols = {};
          this.errData[errRow] = errCols;
        } else {
          errCols = this.errData[errRow];
        }
        const cols = currentError['Spalte'];
        if (cols !== null) {
          // console.log('cols: ', cols);
          const entries = cols.split(';');
          // console.log('entries: ', entries);
          for (let errCol of entries) {
            errCol -= 1;
            let errObj;
            if (errCols[errCol] === undefined) {
              errObj = {};
              errCols[errCol] = errObj;
            } else {
              errObj = errCols[errCol];
            }
            let commentList;
            let status = currentError['Status'];
            if (errObj[status] === undefined) {
              commentList = [];
              errObj[status] = commentList;
            } else {
              commentList = errObj[status];
            }
            commentList.push(currentError['Kommentar']);
          }
        }
      }

    }

    // console.log('this.errData: ', JSON.stringify(this.errData));

    this.options = {
      data: this.data,
      columns: this.columns,
      colHeaders: this.colHeaders,
      rowHeaders: true,
      stretchH: 'all',
      colWidths : [ 40 ],
      autoWrapRow : true,
      columnHeaderHeight: 20,
      comments: true,
      debug: true,
      manualColumnResize : true,
      manualRowResize : true,
      wordWrap: true,
      renderAllRows : this.data.length < 200,
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


    // this.options = {
    //   height: 396,
    //   rowHeaders: true,
    //   stretchH: 'all',
    //   columnSorting: true,
    //   colWidths : [ 40 ],
    //   autoWrapRow : true,
    //   autoWrapCol : true,
    //   comments: true,
    //   debug: true,
    //   manualColumnResize : true,
    //   manualRowResize : true,
    //   wordWrap: true,
    //   headerTooltips: true,
    //   cells: (row, col, prop): any => {
    //     const cellProperties: any = {};

    //     if (this.errData[row]) {
    //       if (this.errData[row][col]) {
    //         cellProperties.errObj = this.errData[row][col];
    //         Object.assign(cellProperties, {renderer: this.cellRenderer});
    //       }
    //     }

    //     return cellProperties;
    //   }
    // };

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

    // add multiple property to the tooltip options
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


  afterChange(event: any) {
    // console.log('afterChange processed');
    // console.log('event: ', event);
  }

}

