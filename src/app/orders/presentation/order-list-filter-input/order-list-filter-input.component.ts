import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    standalone: false,
    selector: 'mibi-order-list-filter-input',
    templateUrl: './order-list-filter-input.component.html',
    styleUrls: ['./order-list-filter-input.component.scss']
})
export class OrderListFilterInputComponent {
    @Input() value = '';
    @Input() ariaLabel = '';
    @Input() placeholder?: string;
    @Output() valueChange = new EventEmitter<string>();

    onInput(next: string): void {
        this.valueChange.emit(next);
    }

    onClear(): void {
        this.valueChange.emit('');
    }
}
