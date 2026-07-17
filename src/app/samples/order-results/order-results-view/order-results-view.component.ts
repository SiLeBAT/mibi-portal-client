import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { SamplesGridViewModel } from '../../samples-grid/samples-grid.model';
import { PathogenTab } from '../results-grid/pathogen-catalog';

interface ParseDateObject {
    iso: string;
}

@Component({
    standalone: false,
    selector: 'mibi-order-results-view',
    templateUrl: './order-results-view.component.html',
    styleUrls: ['./order-results-view.component.scss']
})
export class OrderResultsViewComponent {
    @Input() order: OrderEntryDTO | null | undefined;
    @Input() model: SamplesGridViewModel | null | undefined;
    // grid-template-columns for the reused grid (result columns as equal 1fr).
    @Input() columnTemplate: string | null | undefined;
    @Input() pathogens: PathogenTab[] | null | undefined;
    @Input() selectedPathogenId: string | null | undefined;
    // Only used to force the grid to be recreated when the view mode changes.
    @Input() showFullData: boolean | null | undefined;
    @Output() selectPathogen = new EventEmitter<string>();
    @Output() toggleFullData = new EventEmitter<void>();

    get createdAt(): Date | null {
        const raw = this.order?.createdAt as unknown;
        if (!raw) {
            return null;
        }
        if (raw instanceof Date) {
            return raw;
        }
        if (typeof raw === 'string' || typeof raw === 'number') {
            return new Date(raw);
        }
        if (this.isParseDateObject(raw)) {
            return new Date(raw.iso);
        }
        return null;
    }

    onSelectPathogen(pathogenId: string): void {
        this.selectPathogen.emit(pathogenId);
    }

    // The toggle bar is a column inside the grid; a click anywhere on it bubbles
    // up here (the bar cells carry the .mibi-toggle-cell marker class).
    onGridClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (target.closest('.mibi-toggle-cell')) {
            this.toggleFullData.emit();
        }
    }

    private isParseDateObject(value: unknown): value is ParseDateObject {
        return (
            typeof value === 'object' &&
            value !== null &&
            typeof (value as { iso?: unknown }).iso === 'string'
        );
    }
}
