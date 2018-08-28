import { Component, Input, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { HotTableComponent } from '@handsontable/angular';
import * as Handsontable from 'handsontable';
import * as _ from 'lodash';
import { IAnnotatedSampleData, IErrorResponseDTO, IAutoCorrectionDTO } from '../../models/sample-management.model';

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

enum ToolTipType {
    WARNING = 1,
    ERROR = 2,
    AUTOCORRECTION = 4
}

enum ToolTipColour {
    YELLOW = 'rgb(255, 250, 205)',
    RED = 'rgb(255, 193, 193)',
    BLUE = 'rgb(240, 248, 255)'
}
interface IToolTipConfig {
    theme: string;
    alignmemt: 'bottom' | 'top' | 'left';
    colour: ToolTipColour;
}
export interface ITableDataOutput {
    data: IAnnotatedSampleData[];
    touched: boolean;
    changed: boolean;
}

interface ICellProperties {
    renderer: (instance: any, td: any, row: any, col: any, prop: any, value: any, cp: any) => void;
}

class ToolTip implements IToolTipConfig {

    constructor(public theme: string,
        public alignmemt: 'bottom' | 'top' | 'left',
        public colour: ToolTipColour) { }

    static constructToolTipText(commentList: string[]): string {
        let tooltipText = '<ul>';
        for (const comment of commentList) {
            tooltipText += '<li>';
            tooltipText += comment;
            tooltipText += '</li>';
        }
        tooltipText += '</ul>';
        return tooltipText;
    }
}

@Component({
    selector: 'app-data-grid',
    templateUrl: './data-grid.component.html'
})
export class DataGridComponent implements OnInit {

    settings: any;
    data: Record<string, string>[];
    @ViewChild(HotTableComponent) hotTableComponent: HotTableComponent;
    @Output() valueChanged = new EventEmitter();
    @Input() set sampleData(sampleData: IAnnotatedSampleData[]) {
        this._sampleData = _.cloneDeep(sampleData);
        this.data = this._sampleData.map(e => e.data);
        this.updateTableSettings();
    }

    private _sampleData: IAnnotatedSampleData[];
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

    private ToolTipConfigs: { [key: number]: IToolTipConfig } = {};

    constructor() { }

    ngOnInit(): void {
        this.ToolTipConfigs[ToolTipType.WARNING] = new ToolTip('tooltipster-warning', 'bottom', ToolTipColour.YELLOW);
        this.ToolTipConfigs[ToolTipType.ERROR] = new ToolTip('tooltipster-error', 'top', ToolTipColour.RED);
        this.ToolTipConfigs[ToolTipType.AUTOCORRECTION] = new ToolTip('tooltipster-info', 'left', ToolTipColour.BLUE);
    }

    // Handsontable dictates that this should be an arrow function.
    onAfterChange = (hotInstance: any, changes: any, source: any) => {
        // context -> AppComponent
        if (changes) {
            const tableData: ITableDataOutput = {
                data: this._sampleData,
                touched: true,
                changed: false
            };

            tableData.touched = true;
            if (changes[0][2] !== changes[0][3]) {
                tableData.changed = true;
            }

            this.valueChanged.emit(tableData);
        }

        return false; // returns value in Handsontable
    }

    private updateTableSettings() {
        const errData = this.parseErrors(this._sampleData.map(e => e.errors), this._sampleData.map(e => e.corrections));
        this.settings = {
            colHeaders: this.columnConfigArray.map(c => c.title),
            rowHeaders: true,
            stretchH: 'all',
            colWidths: [50],
            manualColumnResize: true,
            manualRowResize: true,
            renderAllRows: true,
            cells: (cellRow: number, cellCol: number, cellProps: string): any => {
                const cellProperties: ICellProperties = {
                    renderer: (instance: any, td: any, row: any, col: any, prop: any, value: any, cp: any) => {
                        const errObj = errData[cellRow][cellCol];
                        const tooltipOptionList: any[] = [];
                        if (errObj) {
                            for (const s of Object.keys(errObj)) {
                                const status = parseInt(s, 10);
                                td.classList.add('tooltipster-text');
                                td.style.backgroundColor = this.ToolTipConfigs[status].colour;
                                td.style.fontWeight = 'bold';
                                tooltipOptionList.push(this.constructToolTipOption(errObj[status], status));
                            }
                            // add multiple property to the tooltip options => set multiple: true except in first option
                            if (tooltipOptionList.length > 1) {
                                const optionsNum = tooltipOptionList.length;
                                tooltipOptionList[1].multiple = true;
                                if (optionsNum === 3) {
                                    tooltipOptionList[2].multiple = true;
                                }
                            }

                            const instances = $.tooltipster.instances(td);
                            if (instances.length === 0) {
                                for (const option of tooltipOptionList) {
                                    $(td).tooltipster(option);
                                }
                            }
                        }
                        Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cp);
                    }
                };

                return cellProperties;
            }
        };
    }

    private constructToolTipOption(commentList: string[], status: number) {
        const theme: string = this.ToolTipConfigs[status].theme;
        const side: string = this.ToolTipConfigs[status].alignmemt;
        return {
            repositionOnScroll: true,
            animation: 'grow', // fade
            delay: 0,
            theme: theme,
            touchDevices: false,
            trigger: 'hover',
            contentAsHTML: true,
            content: ToolTip.constructToolTipText(commentList),
            side: side
        };
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
