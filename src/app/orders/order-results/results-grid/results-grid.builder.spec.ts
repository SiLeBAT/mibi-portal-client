import { SampleWithResultsDTO } from '../../../core/model/response.model';
import { SamplesGridCellType } from '../../../grid/samples-grid/samples-grid.model';
import { buildResultsGridViewModel } from './results-grid.builder';
import { ResultsGridModel } from './results-grid.model';

const model: ResultsGridModel = {
    headerRowId: 0,
    headerCellType: SamplesGridCellType.TEXT,
    getSampleRowId: index => index + 1,
    columns: [
        {
            colId: 1,
            cellType: SamplesGridCellType.TEXT,
            isRowHeader: true,
            headerText: 'H1',
            getData: (_sample, index) => `v${index}`
        },
        {
            colId: 2,
            cellType: SamplesGridCellType.STACKED,
            isRowHeader: false,
            headerText: 'ignored',
            headerCellType: SamplesGridCellType.TOGGLE,
            getHeaderData: () => 'HD',
            getData: () => ['a', 'b']
        }
    ]
};

const samples = [{}, {}] as unknown as SampleWithResultsDTO[];

describe('buildResultsGridViewModel', () => {
    const vm = buildResultsGridViewModel(model, samples);

    it('lists the header row followed by one row per sample, and the model columns', () => {
        expect(vm.rows).toEqual([0, 1, 2]);
        expect(vm.cols).toEqual([1, 2]);
    });

    it('marks every cell read-only with no editor template', () => {
        vm.rows.forEach(rowId => {
            vm.cols.forEach(colId => {
                const cell = vm.cellModels[rowId][colId];
                expect(cell.isReadOnly).toBe(true);
                expect(cell.editorTemplateId).toBeUndefined();
            });
        });
    });

    it('builds header cells from headerCellType/getHeaderData (falling back to headerText)', () => {
        expect(vm.cellModels[0][1]).toEqual({
            isRowHeader: true,
            isColHeader: true,
            isReadOnly: true,
            cellTemplateId: SamplesGridCellType.TEXT
        });
        expect(vm.cellData[0][1]).toBe('H1');

        expect(vm.cellModels[0][2].cellTemplateId).toBe(SamplesGridCellType.TOGGLE);
        expect(vm.cellData[0][2]).toBe('HD');
    });

    it('builds data cells from the column cellType and getData(sample, index)', () => {
        expect(vm.cellModels[1][1]).toEqual({
            isRowHeader: true,
            isColHeader: false,
            isReadOnly: true,
            cellTemplateId: SamplesGridCellType.TEXT
        });
        expect(vm.cellData[1][1]).toBe('v0');
        expect(vm.cellData[2][1]).toBe('v1');
        expect(vm.cellData[1][2]).toEqual(['a', 'b']);
    });

    it('yields only the header row when there are no samples', () => {
        const empty = buildResultsGridViewModel(model, []);
        expect(empty.rows).toEqual([0]);
    });
});
