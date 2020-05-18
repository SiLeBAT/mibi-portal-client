import {
    Component,
    ChangeDetectionStrategy,
    Input,
    TemplateRef,
    Output,
    EventEmitter
} from '@angular/core';
import {
    DataGridCellViewModel,
    DataGridCellContext,
    DataGridCellData,
    DataGridTemplateMap
} from '../data-grid.model';
import { DataGridCellController } from '../domain/cell-controller.model';
import { DataGridCellTool } from '../domain/cell-tool.entity';
import { DataGridSelectionManager } from '../domain/selection-manager.entity';

@Component({
    selector: 'mibi-data-grid-cell-view',
    templateUrl: './cell-view.component.html',
    styleUrls: ['./cell-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridCellViewComponent {

    get foo() {
        // console.log('gridcell');
        return '';
    }

    @Input() controller: DataGridCellController;
    @Input() templateMap: DataGridTemplateMap<DataGridCellContext>;

    @Input() row: number;
    @Input() col: number;

    @Output() mouseEvent = new EventEmitter<MouseEvent>();

    // TEMPLATE PROPERTIES

    get isRowHeader(): boolean {
        return this.model.isRowHeader;
    }
    get isColHeader(): boolean {
        return this.model.isColHeader;
    }
    get isHeader(): boolean {
        return this.isRowHeader || this.isColHeader;
    }
    get isGridHeader(): boolean {
        return this.isRowHeader && this.isColHeader;
    }

    get hasHoverAnchor() {
        return this.hover.anchor.isOnCell(this.row, this.col);
    }
    get hasSelectionAnchor(): boolean {
        return this.selection.anchor.isOnCell(this.row, this.col);
    }
    get hasSelectionSelector(): boolean {
        return this.selection.selector.isOnCell(this.row, this.col);
    }
    get hasCursor(): boolean {
        return this.cursor.isOnCell(this.row, this.col);
    }
    get hasEditor(): boolean {
        return this.editor.isOnCell(this.row, this.col);
    }

    get isHovered(): boolean {
        if (!this.hover.hasSelection) {
            return false;
        }

        const anchor = this.hover.anchor;
        const anchorOnHeaderEditor = this.hover.isAnchorHeader && this.editor.isOnCell(anchor.row, anchor.col);

        // disbale hovering if editor is on a header
        if (anchorOnHeaderEditor && !this.hasHoverAnchor) {
            return false;
        }

        return this.hover.isSelected(this.row, this.col);
    }

    get isHoverHinted(): boolean {
        if (!this.hover.hasSelection) {
            return false;
        }

        if (!this.isHeader) {
            return false;
        }

        if (this.hasHoverAnchor) {
            return false;
        }

        const anchor = this.hover.anchor;

        if (this.isGridHeader) {
            return anchor.isInCol(this.col) || anchor.isInRow(this.row);
        } else if (this.isColHeader) {
            return anchor.isInCol(this.col);
        } else {
            return anchor.isInRow(this.row);
        }
    }

    get isSelected(): boolean {
        return this.selection.isSelected(this.row, this.col);
    }

    get isSelectionHinted(): boolean {
        if (!this.selection.hasSelection) {
            return false;
        }

        if (!this.isHeader) {
            return false;
        }

        if (this.isSelected || this.hasEditor) {
            return false;
        }

        const hasSelectionInRow = this.selection.hasSelectionInRow(this.row) || this.editor.isInRow(this.row);
        const hasSelectionInCol = this.selection.hasSelectionInCol(this.col) || this.editor.isInCol(this.col);

        if (this.isGridHeader) {
            return hasSelectionInRow || hasSelectionInCol;
        } else if (this.isColHeader) {
            return hasSelectionInCol;
        } else {
            return hasSelectionInRow;
        }
    }

    // TEMPLATE OUTLET PROPERTIES

    get cellTemplate(): TemplateRef<DataGridCellContext> {
        return this.templateMap[this.model.cellTemplateId];
    }

    get cellContext(): DataGridCellContext {
        return {
            model: this.model,
            data: this.data
        };
    }

    // PRIVATE PROPERTIES

    private get cursor(): DataGridCellTool { return this.controller.cursor; }
    private get editor(): DataGridCellTool { return this.controller.editor; }
    private get selection(): DataGridSelectionManager { return this.controller.selection; }
    private get hover(): DataGridSelectionManager { return this.controller.hover; }

    private get model(): DataGridCellViewModel { return this.controller.getCellModel(this.row, this.col); }
    private get data(): DataGridCellData { return this.controller.getCellData(this.row, this.col); }

    // EVENT HANDLERS

    onMouseEvent(e: MouseEvent): void {
        this.mouseEvent.emit(e);
    }
}
