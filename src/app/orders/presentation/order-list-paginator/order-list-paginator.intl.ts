import { MatPaginatorIntl } from '@angular/material/paginator';

export function createOrderPaginatorIntl(): MatPaginatorIntl {
    const intl = new MatPaginatorIntl();
    intl.itemsPerPageLabel = 'Angezeigte Aufträge pro Seite';
    intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        const total = Math.max(length, 0);
        if (total === 0 || pageSize === 0) {
            return `0 - 0 von ${total}`;
        }
        const startIndex = page * pageSize;
        const endIndex = startIndex < total
            ? Math.min(startIndex + pageSize, total)
            : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} von ${total}`;
    };
    return intl;
}
