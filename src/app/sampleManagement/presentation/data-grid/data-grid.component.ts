import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { HotTableComponent } from '@handsontable/angular';
import * as Handsontable from 'handsontable';
import * as _ from 'lodash';
import { IAnnotatedSampleData, IErrorResponseDTO, IAutoCorrectionDTO } from '../../models/models';

interface IStatusComments {
    [status: number]: string[];
}

interface IErrCol {
    [errCol: number]: IStatusComments;
}

interface IErrRow {
    [errRow: number]: IErrCol;
}

interface IColConfig {
    id: string;
    title: string;
}

export interface ITableDataOutput {
    data: IAnnotatedSampleData[];
    touched: boolean;
    changed: boolean;
}

@Component({
    selector: 'app-data-grid',
    templateUrl: './data-grid.component.html'
})
export class DataGridComponent {

    @ViewChild(HotTableComponent) hotTableComponent: HotTableComponent;

    private _sampleData: IAnnotatedSampleData[];
    settings: any;
    data: Record<string, string>[];
    // FIXME: HTML tags in Text?  Formatting shoule be handled by CSS.
    private columnConfigArray: IColConfig[] = [
        {
            id: 'sample_id',
            title: 'Ihre<br>Proben-<br>ummer'
        },
        {
            id: 'sample_id_avv',
            title: 'Probe-<br>nummer<br>nach<br>AVVData'
        },
        {
            id: 'pathogen_adv',
            title: 'Erreger<br>(Text aus<br>ADV-Kat-Nr.16)'
        },
        {
            id: 'pathogen_text',
            title: 'Erreger<br>(Textfeld/<br>Ergänzung)'
        },
        {
            id: 'sampling_date',
            title: 'Datum der<br>Probenahme'
        },
        {
            id: 'isolation_date',
            title: 'Datum der<br>Isolierung'
        },
        {
            id: 'sampling_location_adv',
            title: 'Ort der<br>Probe-<br>nahme<br>(Code aus<br>ADV-Kat-<br>Nr.9)'
        },
        {
            id: 'sampling_location_zip',
            title: 'Ort der<br>Probe-<br>nahme<br>(PLZ)'
        },
        {
            id: 'sampling_location_text',
            title: 'Ort der<br>Probe-<br>nahme<br>(Text)'
        },
        {
            id: 'topic_adv',
            title: 'Oberbe-<br>griff<br>(Kodier-<br>system)<br>der<br>Matrizes<br>(Code aus<br>ADV-Kat-<br>Nr.2)'
        },
        {
            id: 'matrix_adv',
            title: 'Matrix<br>Code<br>(Code<br>aus<br>ADV-<br>Kat-<br>Nr.3)'
        },
        {
            id: 'matrix_text',
            title: 'Matrix<br>(Textfeld/<br>Ergänzung)'
        },
        {
            id: 'process_state_adv',
            title: 'Ver-<br>arbeitungs-<br>zustand<br>(Code aus<br>ADV-Kat-<br>Nr.12)'
        },
        {
            id: 'sampling_reason_adv',
            title: 'Grund<br>der<br>Probe-<br>nahme<br>(Code<br>aus<br>ADV-Kat-<br>Nr.4)'
        },
        {
            id: 'sampling_reason_text',
            title: 'Grund der<br>Probe-<br>nahme<br>(Textfeld/<br>Ergänzung)'
        },
        {
            id: 'operations_mode_adv',
            title: 'Betriebsart<br>(Code aus<br>ADV-Kat-Nr.8)'
        },
        {
            id: 'operations_mode_text',
            title: 'Betriebsart<br>(Textfeld/<br>Ergänzung)'
        },
        {
            id: 'vvvo',
            title: 'VVVO-Nr /<br>Herde'
        },
        {
            id: 'comment',
            title: 'Bemerkung<br>(u.a.<br>Untersuchungs-<br>programm)'
        }
    ];
    constructor() { }

    @Output() valueChanged = new EventEmitter();
    @Input() set sampleData(sampleData: IAnnotatedSampleData[]) {

        this._sampleData = _.cloneDeep(sampleData);

        const errData = this.parseErrors(this._sampleData.map(e => e.errors), this._sampleData.map(e => e.corrections));
        this.data = this._sampleData.map(e => e.data);
        this.updateTableSettings(errData);
    }

    afterChange(changes: any) {
        const tableData: ITableDataOutput = {
            data: this._sampleData,
            touched: false,
            changed: false
        };
        if (changes.params[1] === 'edit') {
            tableData.touched = true;
            if (changes.params[0][0][2] !== changes.params[0][0][3]) {
                tableData.changed = true;
                this.removeWarningAndError(changes.params[0][0][0], changes.params[0][0][1]);
            }
        }
        this.valueChanged.emit(tableData);
    }

    private removeWarningAndError(row: number, column: string) {
        this._sampleData[row].errors[column] = [];
        this._sampleData[row].corrections = _.filter(this._sampleData[row].corrections, e => e.field !== column);
        const errData = this.parseErrors(this._sampleData.map(e => e.errors), this._sampleData.map(e => e.corrections));
        this.updateTableSettings(errData);
    }

    private updateTableSettings(errData: IErrRow) {
        this.settings = {
            colHeaders: this.columnConfigArray.map(c => c.title),
            rowHeaders: true,
            stretchH: 'all',
            colWidths: [50],
            manualColumnResize: true,
            manualRowResize: true,
            renderAllRows: true,
            cells: (row: any, col: any, prop: any): any => {
                const cellProperties: any = {};
                if (errData[row]) {
                    if (errData[row][col]) {
                        cellProperties.errObj = errData[row][col];
                        Object.assign(cellProperties, { renderer: this.cellRenderer });
                    }
                }

                return cellProperties;
            }
        };
        this.hotTableComponent.updateHotTable(this.settings);
    }

    private cellRenderer(instance: any, td: any, row: any, col: any, prop: any, value: any, cellProperties: any) {
        const yellow = 'rgb(255, 250, 205)';
        const red = 'rgb(255, 193, 193)';
        const blue = 'rgb(240, 248, 255)';
        const errObj = cellProperties.errObj;
        const tooltipOptionList: any[] = [];
        const statusList = [4, 1, 2];
        const statusMapper: any = {
            1: ['tooltipster-warning', 'bottom', yellow],
            2: ['tooltipster-error', 'top', red],
            4: ['tooltipster-info', 'left', blue]
        };

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
                const theme: string = statusMapper[status][0];
                const side: string = statusMapper[status][1];
                tooltipOptionList.push({
                    repositionOnScroll: true,
                    animation: 'grow', // fade
                    delay: 0,
                    theme: theme,
                    touchDevices: false,
                    trigger: 'hover',
                    contentAsHTML: true,
                    content: tooltipText,
                    side: side
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

        const instances = $.tooltipster.instances(td);
        if (instances.length === 0) {
            for (const option of tooltipOptionList) {
                $(td).tooltipster(option);
            }
        }
    }

    private parseErrors(errors: IErrorResponseDTO[], corrections: IAutoCorrectionDTO[][]) {
        const errData: IErrRow = {};

        _.forEach(errors, (error, row) => {
            const errRow: IErrCol = {};
            _.forEach(error, (errList, colName) => {
                const col = _.findIndex(this.columnConfigArray.map(c => c.id), header => header === colName);
                const errCol: IStatusComments = {};
                _.forEach(errList, (errItem) => {
                    const currentLevel = errItem['level'];
                    let commentList: any[];
                    if (!errCol[currentLevel]) {
                        commentList = [];
                        errCol[currentLevel] = commentList;
                    } else {
                        commentList = errCol[currentLevel];
                    }
                    commentList.push(errItem['message']);
                });
                errRow[col] = errCol;
            });
            errData[row] = errRow;
        });

        const numbersOnly = new RegExp(/^\d+?/);
        _.forEach(corrections, (correct, row) => {
            _.forEach(correct, (correctedEntry, colName: number) => {
                const colIndex = _.findIndex(this.columnConfigArray.map(c => c.id), header => header === correctedEntry.field);
                if (!errData[row][colIndex]) {
                    errData[row][colIndex] = {};
                }
                let message =
                    `Erreger erkannt. Ursprünglicher Text ${correctedEntry.original} wurde durch den Text aus ADV-Katalog Nr. 16 ersetzt.`;
                if (numbersOnly.test(correctedEntry.original)) {
                    message =
                        // tslint:disable-next-line
                        `ADV-16-Code ${correctedEntry.original} wurde erkannt & durch den entsprechenden ADV-Text ${correctedEntry.corrected} ersetzt.`;
                }
                errData[row][colIndex][4] = [
                    message
                ];
            });

        });

        return errData;
    }
}