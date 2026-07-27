import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { parseOrderDate } from '../../../orders/model/order-date';
import { OrderNeighbours } from '../../../orders/state/order-list.selectors';
import { SamplesGridViewModel } from '../../samples-grid/samples-grid.model';
import { PathogenTab } from '../results-grid/pathogen-catalog';

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
    @Input() neighbours: OrderNeighbours | null | undefined;
    @Output() selectPathogen = new EventEmitter<string>();
    @Output() toggleFullData = new EventEmitter<void>();
    @Output() openOrder = new EventEmitter<string>();
    @Output() downloadDisplayed = new EventEmitter<void>();
    @Output() downloadAll = new EventEmitter<void>();

    get createdAt(): Date | null {
        return parseOrderDate(this.order?.createdAt);
    }

    get hasNewerOrder(): boolean {
        return !!this.neighbours?.newerOrderId;
    }

    get hasOlderOrder(): boolean {
        return !!this.neighbours?.olderOrderId;
    }

    onOpenNewerOrder(): void {
        const orderId = this.neighbours?.newerOrderId;
        if (orderId) {
            this.openOrder.emit(orderId);
        }
    }

    onOpenOlderOrder(): void {
        const orderId = this.neighbours?.olderOrderId;
        if (orderId) {
            this.openOrder.emit(orderId);
        }
    }

    onDownloadDisplayed(): void {
        this.downloadDisplayed.emit();
    }

    onDownloadAll(): void {
        this.downloadAll.emit();
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
}
