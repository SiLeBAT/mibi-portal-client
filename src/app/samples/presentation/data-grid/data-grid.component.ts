import { Component, Input, ViewChild, Output, EventEmitter, OnInit, ElementRef, AfterViewChecked } from '@angular/core';
import { HotTableComponent } from '@handsontable/angular';
import 'tooltipster';
import Handsontable, * as HT from 'handsontable';
import * as _ from 'lodash';
import {
    TableDataOutput, ColConfig
} from '../../model/sample-management.model';
import {
    ToolTipTheme, ToolTip, createToolTip, ToolTipType
} from '../../../shared/model/tooltip.model';

enum HotChangeIndex {
    INDEX = 0,
    COL_ID = 1,
    ORIGINAL_VALUE = 2,
    NEW_VALUE = 3
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
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit, AfterViewChecked {

    @Input() set viewModel(vm: IFormViewModel) {
        this.vm = _.cloneDeep(vm);
    }

    @Input() colConfig: ColConfig[];
    @Output() valueChanged = new EventEmitter<TableDataOutput>();

    @ViewChild(HotTableComponent, { static: false }) hotTableComponent: HotTableComponent;
    @ViewChild('hotTableContainer', { static: false }) private containerElement: ElementRef;

    settings: Handsontable.GridSettings;
    vm: IFormViewModel;
    private ToolTips: { [key: number]: ToolTip } = {};

    ngOnInit(): void {
        this.ToolTips[ToolTipType.WARNING]
            = createToolTip(ToolTipTheme.WARNING, 'bottom');
        this.ToolTips[ToolTipType.ERROR] = createToolTip(ToolTipTheme.ERROR, 'top');
        this.ToolTips[ToolTipType.TIP]
            = createToolTip(ToolTipTheme.TIP, 'right');
        this.ToolTips[ToolTipType.INFO]
            = createToolTip(ToolTipTheme.INFO, 'left');

        this.settings = {
            licenseKey: 'non-commercial-and-evaluation',
            colHeaders: this.colConfig.map(c => c.title),
            // causes layout issues
            // rowHeaders: true,
            stretchH: 'all',
            colWidths: 70,
            columnHeaderHeight: 150,
            renderAllRows: true,
            viewportColumnRenderingOffset: 100,
            viewportRowRenderingOffset: 100,
            autoColumnSize: { useHeaders: true },
            manualColumnResize: true,
            manualRowResize: true,
            wordWrap: true,
            cells: this.createCellVisitor(),
            columns: this.colConfig.map(col => {
                return {
                    data: col.id + '.value',
                    readOnly: !!col.readOnly
                };
            })
        };
    }

    onAfterChange = (changes: any, source: string) => {
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

                    const tableData: TableDataOutput = {
                        changed: {
                            rowIndex,
                            columnId,
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
        return (cellRow: number, cellCol: number): Handsontable.CellMeta => {
            const cellConfig: IFormCellViewModel = this.vm.data[cellRow][this.colConfig[cellCol].id];
            const cellProperties: Handsontable.CellMeta = {
                tooltipOptionList: [],
                className: '',
                renderer: this.cellRenderer
            };

            if (this.colConfig[cellCol].readOnly) {
                cellProperties.className = cellProperties.className + ' readonly';
            }
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
            return HT.default.renderers.AutocompleteRenderer(instance, td, row, col, prop, value, cp);
        } else {
            return HT.default.renderers.TextRenderer(instance, td, row, col, prop, value, cp);
        }
    }

    onResize() {
        // for firefox (throws a elementToCheck exception on resize)
        this.hotTableComponent.updateHotTable({});
    }

    ngAfterViewChecked(): void {
        // // the handsontable updates its size if the page size is adjusted i.e. the <body> onresize event occurs
        // // it does not respond to size changes of its parent container, so the handsontable must be updated manually
        // // e.g. displaying the mibi-banner resizes the tables parent container but not the page itself
        this.updateHotTableSize();
    }

    private updateHotTableSize() {
        const containerRect = this.containerElement.nativeElement.getBoundingClientRect();

        // use first handsontable element with defined size
        const hotTableRect = this.containerElement.nativeElement.firstChild.firstChild.getBoundingClientRect();

        if (hotTableRect.height !== containerRect.height || hotTableRect.width !== containerRect.width) {
            this.hotTableComponent.updateHotTable({});
        }
    }
}
