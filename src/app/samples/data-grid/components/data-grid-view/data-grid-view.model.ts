export interface DataGridCell {
    row: number;
    col: number;
}

export class DataGridUICell implements DataGridCell {
    row: number;
    col: number;

    constructor() {
        this.clear();
    }

    set(row: number, col: number): void {
        this.row = row;
        this.col = col;
    }

    clear(): void {
        this.row = -1;
        this.col = -1;
    }

    isActiveCell(row: number, col: number): boolean {
        return this.row === row && this.col === col;
    }

    isActive(): boolean {
        return !this.isActiveCell(-1, -1);
    }
}

export class DataGridSelection {
    private readonly anchor = new DataGridUICell();
    private selection: DataGridCell[] = [];

    isSelected(row: number, col: number): boolean {
        return !!this.selection.find(v => v.row === row && v.col === col);
    }

    clear(): void {
        this.anchor.clear();
        this.selection = [];
    }

    doSelection(): boolean {
        return this.anchor.isActive();
    }

    isAnchorCell(row: number, col: number): boolean {
        return this.anchor.isActiveCell(row, col);
    }

    start(row: number, col: number, rows: number, cols: number): void {
        this.anchor.set(row, col);
        this.select(row, col, rows, cols);
    }

    select(row: number, col: number, rows: number, cols: number): void {
        const c1 = this.anchor.col;
        const r1 = this.anchor.row;
        let c2 = c1 + (col - c1);
        let r2 = r1 + (row - r1);
        if (c1 === 0) {
            c2 = cols - 1;
        }
        if (r1 === 0) {
            r2 = rows - 1;
        }

        this.selection = [];

        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
            for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
                this.selection.push({ row: r, col: c });
            }
        }
    }
}

export class DataGridEditor {
    private readonly cell = new DataGridUICell();
    data: string = '';

    get row(): number {
        return this.cell.row;
    }

    get col(): number {
        return this.cell.col;
    }

    start(initialData: string, row: number, col: number): void {
        this.data = initialData;
        this.cell.set(row, col);
    }

    clear(): void {
        this.cell.clear();
        this.data = '';
    }

    isActiveCell(row: number, col: number): boolean {
        return this.cell.isActiveCell(row, col);
    }

    isActive(): boolean {
        return this.cell.isActive();
    }
}
