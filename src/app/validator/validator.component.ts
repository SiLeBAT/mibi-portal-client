import { Component, OnInit, ViewChild } from '@angular/core';
import * as Handsontable from 'handsontable';
import * as $ from 'jquery';
import * as Tooltipster from 'tooltipster';

import * as data from './../utils/jsonOutput/out.postman.v14.test.json';
import { HotTableComponent } from 'ng2-handsontable';


@Component({
  selector: 'app-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.css']
})
export class ValidatorComponent implements OnInit {


  errors = data['outputValues']['json-output-4']['errors'];
  origdata = data['outputValues']['json-output-4']['origdata'];

  @ViewChild(HotTableComponent) hotTableComponent: HotTableComponent;
  // private handsonTableInstance: Handsontable;

  private data: any[];
  private colHeaders: string[];
  // private colHeaders2: string[];
  private columns: any[];
  // private columns2: any[];
  private options: any;
  private errData: any;


  constructor() {
  }

  ngOnInit() {
    console.log('ngOnInit, this.hotTableComponent: ', this.hotTableComponent);
    const inst = this.hotTableComponent['inst'];
    console.log('ngOnInit, inst: ', inst);
    const handsonTableInstance = this.hotTableComponent.getHandsontableInstance();
    console.log('ngOnInit, handsonTableInstance: ', handsonTableInstance);


    console.log('errors: ', this.errors);
    console.log('errors["data"]: ', this.errors['data']);
    console.log('origdata: ', this.origdata);

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
            let dataList;
            if (errCols[errCol] === undefined) {
              dataList = [];
              errCols[errCol] = dataList;
            } else {
              dataList = errCols[errCol];
            }
            const dataEntry = {};
            dataList.push(dataEntry);
            dataEntry['status'] = currentError['Status'];
            dataEntry['comment'] = currentError['Kommentar'];
          }
        }
      }

    }
    console.log('this.errData: ', this.errData);
    const testRow = 0;
    const testCol = 5;
    console.log('this.errData[testRow]: ', this.errData[testRow]);
    // console.log('this.errData[testRow][testCol]: ', this.errData[testRow][testCol]);
    if (this.errData[testRow]) {
      if (this.errData[testRow][testCol]) {
        console.log('this.errData[testRow][testCol]: true for : ', testRow, ' ', testCol);
      }
    } else {
      console.log('this.errData[testRow][testCol]: false for : ', testRow, ' ', testCol);
    }

    // this.data = this.getFinanceData();
    // this.colHeaders = ['Price', 'Date', '1D Chg', 'YTD Chg', 'Vol BTC'];
    // this.columns = [
    //   {type: 'numeric', numericFormat: { pattern: '$0,0.00', culture: 'en-US' }},
    //   {type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true},
    //   {type: 'numeric', numericFormat: { pattern: '0.00%' }},
    //   {type: 'numeric', numericFormat: { pattern: '0.00%' }},
    //   {type: 'numeric', numericFormat: { pattern: '0.00' }}
    // ];
    this.options = {
      height: 396,
      rowHeaders: true,
      stretchH: 'all',
      columnSorting: true,
      colWidths : [ 40 ],
      autoWrapRow : true,
      autoWrapCol : true,
      comments: true,
      debug: true,
      manualColumnResize : true,
      manualRowResize : true,
      wordWrap: true,
      headerTooltips: true,
      cells: (row, col, prop): any => {
        const cellProperties: any = {};

        if (this.errData[row]) {
          if (this.errData[row][col]) {
            cellProperties.dataList = this.errData[row][col];
            Object.assign(cellProperties, {renderer: this.cellRenderer});
          }
        }

        // Object.assign(cellProperties, {renderer: this.colorRenderer
        // });

        // console.log('cell, row: ', row);
        // console.log('cell, col: ', col);
        // console.log('cell, prop: ', prop);

        // if (row === 0) {
        //   Object.assign(cellProperties, {renderer: headerRenderer});
        // } else if (row === 3) {
        //   Object.assign(cellProperties, {renderer: diffRenderer});
        // } else if (row === 5) {
        //   Object.assign(cellProperties, {renderer: incomeOrExpensesRenderer});
        // } else if (row === 13) {
        //   Object.assign(cellProperties, {renderer: incomeOrExpensesRenderer});
        // } else if (row === 14) {
        //   Object.assign(cellProperties, {renderer: boldAndAlignRenderer});
        // } else if (row === 21) {
        //   Object.assign(cellProperties, {renderer: boldAndAlignRenderer});
        // } else if (row === 27) {
        //   Object.assign(cellProperties, {renderer: boldAndAlignRenderer});
        // } else if (row === 36) {
        //   Object.assign(cellProperties, {renderer: boldAndAlignRenderer});
        // }

        // if ([1, 2, 3].indexOf(row) !== -1 && col >= 1) {
        //   cellProperties.readOnly = true;
        // }

        // const a42 = Array.apply(0, Array(42)).map((x, y) => y + 1);
        // if (a42.indexOf(row) !== -1 && col >= 1) {
        //   cellProperties.type = 'numeric';
        //   cellProperties.numericFormat = { pattern: '$0,0.00', culture: 'en-US' };
        // }

        return cellProperties;
      }    };

  }

  // ngAfterViewInit() {
  //   const handsonTableInstance = this.hotTableComponent.getHandsontableInstance();
  //   console.log('ngAfterViewInit, handsonTableInstance: ', handsonTableInstance);
  // }

  cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    // console.log('cellProperties.dataList: ', cellProperties.dataList);
    // console.log('instance: ', instance);
    // console.log('td: ', td);
    // console.log('row: ', row);
    // console.log('col: ', col);
    // console.log('prop: ', prop);
    // console.log('value: ', value);
    // console.log('cellProperties: ', cellProperties);


    const yellow = 'rgb(255, 250, 205)';
    const red = 'rgb(255, 193, 193)';
    const blue = 'rgb(240, 248, 255)';
    const dataList = cellProperties.dataList;
    let status: number;
    let titleText = '';
    const commentList = [];
    for (const listEntry of dataList) {
      status = listEntry.status;
      titleText += '- ';
      titleText += listEntry.comment;
      titleText += '\n';
    }

    Handsontable.renderers.TextRenderer.apply(this, arguments);
    // console.log('td: ', td);
    // console.log('typeof td: ', (typeof td));

    // const tdElement = '<span class="tooltiptext">Tooltip text</span>';
    // td.className = 'tooltip';
    // td.innerHTML = td.innerHTML;
    // td.innerHTML = td.innerHTML + tdElement;

    // console.log('td: ', td);



    td.style.fontWeight = 'bold';
    // td.setAttribute('data-toggle', 'tooltip');
    // td.setAttribute('data-placement', 'bottom');
    td.setAttribute('title', titleText);
    td.className = 'yellow-tooltip';

    // Tooltipster.tooltipster({});

    // $(td).tooltipster(
    //   {
    //     /*
    //     functionBefore: function(instance, helper) {
    //       console.log(row + " - " + col + " - ");
    //     },
    //      */
    //     repositionOnScroll : true,
    //     animation : 'grow', // fade
    //     delay : 0,
    //     theme : [ 'tooltipster-error' ],
    //     touchDevices : false,
    //     trigger : 'hover',
    //     contentAsHTML : true,
    //     content : "<ul type='disc'>"
    //         + 'blah blub error' + "</ul>", // row+"-"+col+":<br>"+
    //     side : 'top',
    //     arrowColor : '#ffc1c1'
    //   });


    // $('[data-toggle="tooltip"]').tooltip();

    // td.title = 'should be tooltip\nsecond line';
    if (status === 1) {
      td.style.backgroundColor = yellow; // yellow
    } else if (status === 2) {
      td.style.backgroundColor = red; // red
    } else if (status === 4) {
      td.style.backgroundColor = blue; // blue
    }


    // $(td).tooltip({
    //   trigger: 'hover active',
    //   title: prop + ' ' + 'blah blub',
    //   placement: 'auto',
    //   container: 'body',
    //   template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
    // });
    // td.innerHTML = td.innerHTML + tdElement;
    console.log('td: ', td);


  }


  afterChange(event: any) {
    console.log('afterChange processed');
    console.log('event: ', event);
  }

  setTooltip(event: any) {
    // console.log('event: ', event[0]);
    // console.log('coords: ', event[1]);
    // console.log('td: ', event[2]);
  }





  // headerRenderer(instance, td, row, col, prop, value, cellProperties) {
  //   // tslint:disable-next-line:no-invalid-this
  //   Handsontable.renderers.TextRenderer.apply(this, arguments);
  //   td.style.fontWeight = 'bold';
  //   td.style.textAlign = 'center';
  // }

  // diffRenderer(instance, td, row, col, prop, value, cellProperties) {
  //   // tslint:disable-next-line:no-invalid-this
  //   Handsontable.cellTypes['formula'].renderer.apply(this, arguments); // tslint:disable-line:no-string-literal
  //   td.style.backgroundColor = '#c3f89c';
  //   td.style.fontWeight = (col === 13 ? 'bold' : 'normal');
  // }

  // incomeOrExpensesRenderer(instance, td, row, col, prop, value, cellProperties) {
  //   // tslint:disable-next-line:no-invalid-this
  //   Handsontable.renderers.TextRenderer.apply(this, arguments);
  //   td.style.fontWeight = 'bold';
  //   td.style.textAlign = 'left';
  //   td.style.backgroundColor = '#BDD7EE';
  // }

  // boldAndAlignRenderer(instance, td, row, col, prop, value, cellProperties) {
  //   // tslint:disable-next-line:no-invalid-this
  //   Handsontable.renderers.TextRenderer.apply(this, arguments);
  //   td.style.fontWeight = 'bold';
  //   td.style.verticalAlign = 'middle';
  //   td.style.textAlign = 'left';
  // }






}

/*
Features, die wichtig waren bei der Auswahl der Tabelle sind:
- editierbar - und das Editieren findet direkt in der Zelle statt und nicht durch ein überlagertes Textfeld
- copy/paste
- json-fähig (json kann geladen und abgespeichert werden, damit es auf den Server gespielt werden kann)
- tooltipster (o.ä.) kann integriert werden -> highly customizable was das Aussehen angeht
- soviel Excel-ähnlich wie möglich (das kennen die Leute)
*/
