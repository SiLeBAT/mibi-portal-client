import { Component, Input, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { HotTableComponent } from '@handsontable/angular';
import 'tooltipster';
import * as Handsontable from 'handsontable';
import * as _ from 'lodash';
import {
    ITableDataOutput, IColConfig
} from '../../model/sample-management.model';
import {
    ToolTipTheme, IToolTip, createToolTip, ToolTipType
} from '../../../shared/model/tooltip.model';

enum HotChangeIndex {
    INDEX = 0,
    COL_ID = 1,
    ORIGINAL_VALUE = 2,
    NEW_VALUE = 3

}

interface ICellProperties {
    tooltipOptionList: any[];
    className: string;
    renderer?: (instance: any, td: any, row: any, col: any, prop: any, value: any, cp: any) => void;
    source?: string[];
    type?: string;
    strict?: boolean;
    filter?: boolean;
    trimDropdown?: boolean;
    visibleRows?: number;
}

interface IColumnProperties {
    data: string;
}
interface IHotSettings {

    colHeaders: string[];
    rowHeaders: boolean;
    stretchH: string;
    colWidths: number[];
    manualColumnResize: boolean;
    manualRowResize: boolean;
    renderAllRows: boolean;
    cells: (cellRow: number, cellCol: number, cellProp: string) => any;
    columns?: (col: number) => IColumnProperties | undefined;
}

enum HotSource {
    LOAD_DATA = 'loadData',
    COPY_PAST = 'CopyPaste.paste',
    EDIT = 'edit'
}

export interface IFormViewModel {
    data: IFormRowViewModel[];
}

export interface IFormRowViewModel {
    [key: string]: IFormCellViewModel;
}
export interface IErrorViewModel {
    severity: string;
    errorMessage: string[];
    warningMessage: string[];
    autoCorrectMessage: string[];
}
export interface IFormCellViewModel {
    id: string;
    value: string;
    correctionOffer: string[];
    errors?: IErrorViewModel;
    editMessage: string[];
}

@Component({
    selector: 'mibi-data-grid',
    templateUrl: './data-grid.component.html'
})
export class DataGridComponent implements OnInit {

    settings: IHotSettings;

    @Input() colConfig: IColConfig[];

    @ViewChild(HotTableComponent) hotTableComponent: HotTableComponent;
    @Output() valueChanged = new EventEmitter();

    @Input() set viewModel(vm: IFormViewModel) {
        this.vm = _.cloneDeep(vm);
    }

    vm: IFormViewModel;
    private ToolTips: { [key: number]: IToolTip } = {};

    constructor() { }

    ngOnInit(): void {
        this.ToolTips[ToolTipType.WARNING]
            = createToolTip(ToolTipTheme.WARNING, 'bottom');
        this.ToolTips[ToolTipType.ERROR] = createToolTip(ToolTipTheme.ERROR, 'top');
        this.ToolTips[ToolTipType.TIP]
            = createToolTip(ToolTipTheme.TIP, 'right');
        this.ToolTips[ToolTipType.INFO]
            = createToolTip(ToolTipTheme.INFO, 'left');

        this.settings = {
            colHeaders: this.colConfig.map(c => c.title),
            rowHeaders: true,
            stretchH: 'all',
            colWidths: [50],
            manualColumnResize: true,
            manualRowResize: true,
            renderAllRows: true,
            cells: this.createCellVisitor(),
            columns: (col: number) => {
                if (col < this.colConfig.length) {
                    return {
                        data: this.colConfig[col].id + '.value'
                    };
                }
                return undefined;
            }
        };
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
                    const columnId = changeArray[HotChangeIndex.COL_ID].replace('.value', '');

                    const tableData: ITableDataOutput = {
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
            const cellConfig: IFormCellViewModel = this.vm.data[cellRow][this.colConfig[cellCol].id];
            const cellProperties: ICellProperties = {
                tooltipOptionList: [],
                className: '',
                renderer: this.cellRenderer
            };

            if (cellConfig.correctionOffer.length) {
                cellProperties.source = cellConfig.correctionOffer;
                cellProperties.type = 'autocomplete';
                cellProperties.filter = false;
                cellProperties.strict = false;
                cellProperties.trimDropdown = false;
                cellProperties.visibleRows = 21;
            }

            if (cellConfig.editMessage.length) {
                cellProperties.className = cellProperties.className + ' changed';
                cellProperties.tooltipOptionList.push(
                    this.ToolTips[ToolTipType.TIP].getOptions(cellConfig.editMessage));
            }

            if (cellConfig.errors) {
                cellProperties.className = cellProperties.className + ' ' + cellConfig.errors.severity;
                if (cellConfig.errors.errorMessage.length) {
                    cellProperties.tooltipOptionList.push(this.ToolTips[ToolTipType.ERROR].getOptions(cellConfig.errors.errorMessage));
                }
                if (cellConfig.errors.warningMessage.length) {
                    cellProperties.tooltipOptionList.push(this.ToolTips[ToolTipType.WARNING].getOptions(cellConfig.errors.warningMessage));
                }
                if (cellConfig.errors.autoCorrectMessage.length) {
                    cellProperties.tooltipOptionList.push(this.ToolTips[ToolTipType.INFO].getOptions(cellConfig.errors.autoCorrectMessage));
                }
            }

            return cellProperties;
        };
    }

    // Handsontable dictates that this should be an arrow function.
    private cellRenderer = (instance: any, td: any, row: any, col: any, prop: any, value: any, cp: any) => {
        const instances = $.tooltipster.instances(td);
        for (const i of instances) {
            i.destroy();
        }

        for (const option of cp.tooltipOptionList) {
            $(td).tooltipster(option);
        }

        if (cp.type === 'autocomplete') {
            cp.className = cp.className + ' showArrow';
            return Handsontable.renderers.AutocompleteRenderer(instance, td, row, col, prop, value, cp);
        } else {
            return Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cp);
        }
    }
}
