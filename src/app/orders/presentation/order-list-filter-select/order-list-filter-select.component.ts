import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResultsFilterValue } from '../../model/order-list-filter.model';

@Component({
    standalone: false,
    selector: 'mibi-order-list-filter-select',
    templateUrl: './order-list-filter-select.component.html',
    styleUrls: ['./order-list-filter-select.component.scss']
})
export class OrderListFilterSelectComponent {
    @Input() value: ResultsFilterValue = '';
    @Input() ariaLabel = '';
    @Output() valueChange = new EventEmitter<ResultsFilterValue>();

    onSelect(next: ResultsFilterValue): void {
        this.valueChange.emit(next);
    }

    onClear(): void {
        this.valueChange.emit('');
    }
}
