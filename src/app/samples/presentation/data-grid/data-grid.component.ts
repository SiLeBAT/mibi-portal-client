import { Component, Input, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { HotTableComponent } from '@handsontable/angular';
import 'tooltipster';
import * as Handsontable from 'handsontable';
import * as _ from 'lodash';
import {
    SampleData, ChangedValueCollection
} from '../../model/sample-management.model';
import {
    ToolTipTheme, IToolTip, createToolTip, TOOLTIP_CLASS_HOOK
} from '../../../shared/model/tooltip.model';

enum AlteredField {
    WARNING = 'warn',
    ERROR = 'error',
    AUTOCORRECTED = 'corrected'
}

enum ToolTipType {
    WARNING = 1,
    ERROR = 2,
    TIP = 3,
    INFO = 4
}

export interface IStatusComments {
    [status: number]: string[];
}

export interface IErrCol {
    [errCol: number]: IStatusComments;
}

export interface IErrRow {
    [errRow: number]: IErrCol;
}

export interface IColConfig {
    id: string;
    title: string;
}

export interface ITableDataOutput {
    data: SampleData[];
    touched: boolean;
    changed: IChangedDataGridField;
}

enum HotChangeIndex {
    INDEX = 0,
    COL_ID = 1,
    ORIGINAL_VALUE = 2,
    NEW_VALUE = 3

}

interface IChangedDataGridField {
    rowIndex: number;
    columnId: string;
    originalValue: string;
    newValue: string;
}

interface ICellProperties {
    tooltipOptionList: any[];
    errData?: IStatusComments;
    changed?: ChangedValueCollection;
    renderer?: (instance: any, td: any, row: any, col: any, prop: any, value: any, cp: any) => void;
}

interface IHotSettings {

    colHeaders: string[];
    rowHeaders: boolean;
    stretchH: string;
    colWidths: number[];
    manualColumnResize: boolean;
    manualRowResize: boolean;
    renderAllRows: boolean;
    cells: (cellRow: number, cellCol: number, cellProp: string) => ICellProperties;
}

enum HotSource {
    LOAD_DATA = 'loadData',
    COPY_PAST = 'CopyPaste.paste',
    EDIT = 'edit'
}

@Component({
    selector: 'mibi-data-grid',
    templateUrl: './data-grid.component.html'
})
export class DataGridComponent implements OnInit {

    settings: IHotSettings;

    @Input() colTitles: string[];

    @ViewChild(HotTableComponent) hotTableComponent: HotTableComponent;
    @Output() valueChanged = new EventEmitter();

    @Input() set data(sampleData: SampleData[]) {
        this.localData = _.cloneDeep(sampleData);
    }

    @Input() set errorData(errData: IErrRow) {
        this._errorData = errData;
        this.changeSettings();
    }

    @Input() set changedData(data: ChangedValueCollection) {
        this._changedData = data;
        this.changeSettings();
    }

    localData: SampleData[];
    private ToolTips: { [key: number]: IToolTip } = {};
    private _errorData: IErrRow;
    private _changedData: ChangedValueCollection;

    constructor() { }

    ngOnInit(): void {
        this.ToolTips[ToolTipType.WARNING]
            = createToolTip(ToolTipTheme.WARNING, 'bottom');
        this.ToolTips[ToolTipType.ERROR] = createToolTip(ToolTipTheme.ERROR, 'top');
        this.ToolTips[ToolTipType.INFO]
            = createToolTip(ToolTipTheme.INFO, 'left');
        this.changeSettings();
    }

    // Handsontable dictates that this should be an arrow function.
    onAfterChange = (hotInstance: any, changes: any, source: string) => {
        // context -> AppComponent
        switch (source) {
            case HotSource.EDIT:
            case HotSource.COPY_PAST:
                if (changes[0][HotChangeIndex.ORIGINAL_VALUE] !== changes[0][HotChangeIndex.NEW_VALUE]) {
                    const changeArray = changes[0];
                    const originalValue = changeArray[HotChangeIndex.ORIGINAL_VALUE];
                    const newValue = changeArray[HotChangeIndex.NEW_VALUE];
                    const rowIndex = changeArray[HotChangeIndex.INDEX];
                    const columnId = changeArray[HotChangeIndex.COL_ID];

                    const tableData: ITableDataOutput = {
                        data: this.localData,
                        touched: true,
                        changed: {
                            rowIndex,
                            columnId,
                            originalValue,
                            newValue
                        }
                    };

                    this.valueChanged.emit(tableData);
                }
                return false;
            default:
                return false;
        }
    }

    private createCellVisitor() {
        return (cellRow: number, cellCol: number, cellProp: string): any => {
            let cellProperties: ICellProperties = {
                tooltipOptionList: []
            };

            if (this._errorData && this._errorData[cellRow] && this._errorData[cellRow][cellCol]) {
                for (const s of Object.keys(this._errorData[cellRow][cellCol])) {
                    const status = parseInt(s, 10);
                    cellProperties.tooltipOptionList.push(this.ToolTips[status].getOptions(this._errorData[cellRow][cellCol][status]));
                }
            }

            if (cellProperties.tooltipOptionList.length || this.hasChangedFields(cellRow, cellProp)) {
                cellProperties = {
                    ...cellProperties, ...{
                        errData: this._errorData[cellRow][cellCol],
                        changed: (this._changedData[cellRow] as any)[cellProp],
                        renderer: this.cellRenderer
                    }
                };
            }
            return cellProperties;
        };
    }

    private hasChangedFields(cellRow: number, cellProp: string): boolean {
        return !!this._changedData[cellRow] && ((this._changedData[cellRow] as any)[cellProp] !== undefined);
    }

    private changeSettings() {
        this.settings = {
            colHeaders: this.colTitles,
            rowHeaders: true,
            stretchH: 'all',
            colWidths: [50],
            manualColumnResize: true,
            manualRowResize: true,
            renderAllRows: true,
            cells: this.createCellVisitor()
        };
    }

    // Handsontable dictates that this should be an arrow function.
    private cellRenderer = (instance: any, td: any, row: any, col: any, prop: any, value: any, cp: any) => {
        const errObj = cp.errData;
        if (cp.changed !== undefined) {
            td.classList.add('changed');
        }
        if (cp.tooltipOptionList.length) {
            for (const s of Object.keys(errObj)) {
                const status = parseInt(s, 10);
                td.classList.add(TOOLTIP_CLASS_HOOK);
                td.classList.add(this.getFieldBackground(status));
            }
            // add multiple property to the tooltip options => set multiple: true except in first option
            if (cp.tooltipOptionList.length > 1) {
                const optionsNum = cp.tooltipOptionList.length;
                cp.tooltipOptionList[1].multiple = true;
                if (optionsNum === 3) {
                    cp.tooltipOptionList[2].multiple = true;
                }
            }

            const instances = $.tooltipster.instances(td);
            if (instances.length === 0) {
                for (const option of cp.tooltipOptionList) {
                    $(td).tooltipster(option);
                }
            }
        }
        Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cp);
    }

    private getFieldBackground(status: number): string {
        let fieldClassName = '';
        switch (status) {
            case 1:
                fieldClassName = AlteredField.WARNING;
                break;
            case 2:
                fieldClassName = AlteredField.ERROR;
                break;
            case 4:
                fieldClassName = AlteredField.AUTOCORRECTED;
                break;
            default:
        }
        return fieldClassName;
    }
}
