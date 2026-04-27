import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { DataGridViewComponent } from './data-grid-view.component';
import { DataGridViewModel } from './data-grid.model';

function buildModel(rowCount: number): DataGridViewModel {
    const rows = Array.from({ length: rowCount }, (_, i) => i);
    const cols = [0, 1];
    const cellModels: DataGridViewModel['cellModels'] = {};
    const cellData: DataGridViewModel['cellData'] = {};
    for (const row of rows) {
        cellModels[row] = {
            0: { isReadOnly: true, isColHeader: false, isRowHeader: true, cellTemplateId: 0 },
            1: { isReadOnly: false, isColHeader: false, isRowHeader: false, cellTemplateId: 0 }
        };
        cellData[row] = { 0: '', 1: '' };
    }
    return { rows: rows, cols: cols, cellModels: cellModels, cellData: cellData };
}

describe('DataGridViewComponent', () => {
    let component: DataGridViewComponent;
    let scrollEl: { scrollTop: number };

    beforeEach(() => {
        const changeDetectorRef = {
            detach: jest.fn(),
            detectChanges: jest.fn()
        } as unknown as ChangeDetectorRef;

        component = new DataGridViewComponent(changeDetectorRef);

        scrollEl = { scrollTop: 0 };
        (component as any).gridRefScroll = { nativeElement: scrollEl };
        (component as any).gridRef = { nativeElement: { getBoundingClientRect: () => new DOMRect() } };

        const initialModel = buildModel(40);
        component.model = initialModel;
        component.cellTemplates = {} as any;
        component.editorTemplates = {} as any;
        component.ngOnChanges({ model: new SimpleChange(undefined, initialModel, true) });
    });

    describe('scroll position', () => {
        it('should reset scroll to 0 on first load', () => {
            expect(scrollEl.scrollTop).toBe(0);
        });

        it('should NOT reset scroll when only cellData changes (cell edit confirm at row 40)', () => {
            scrollEl.scrollTop = 500;

            const oldModel = component.model;
            const newCellData = {
                ...oldModel.cellData,
                [39]: { 0: '', 1: 'edited value' }
            };
            const newModel: DataGridViewModel = { ...oldModel, cellData: newCellData };
            component.model = newModel;

            component.ngOnChanges({ model: new SimpleChange(oldModel, newModel, false) });

            expect(scrollEl.scrollTop).toBe(500);
        });

        it('should reset scroll to 0 when rows change (new sheet uploaded)', () => {
            scrollEl.scrollTop = 500;

            const oldModel = component.model;
            const newModel = buildModel(50);
            component.model = newModel;

            component.ngOnChanges({ model: new SimpleChange(oldModel, newModel, false) });

            expect(scrollEl.scrollTop).toBe(0);
        });

        it('should reset scroll to 0 when cols change (new sheet uploaded)', () => {
            scrollEl.scrollTop = 500;

            const oldModel = component.model;
            const newModel: DataGridViewModel = { ...oldModel, cols: [0, 1, 2] };
            component.model = newModel;

            component.ngOnChanges({ model: new SimpleChange(oldModel, newModel, false) });

            expect(scrollEl.scrollTop).toBe(0);
        });
    });
});
