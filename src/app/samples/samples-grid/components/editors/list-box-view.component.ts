import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';

interface FilteredValue {
    pre: string;
    filter: string;
    post: string;
}

@Component({
    selector: 'mibi-samples-grid-list-box-view',
    templateUrl: './list-box-view.component.html',
    styleUrls: ['./list-box-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridListBoxViewComponent implements OnChanges {

    @Input() values: string[];
    @Input() filter: string | undefined;

    @Input() selection: number = -1;
    @Output() selectionChange = new EventEmitter<number>();

    @Output() hoverChange = new EventEmitter<number>();

    @Output() focusAcquire = new EventEmitter<void>();
    @Output() focusRelease = new EventEmitter<void>();

    @Output() confirm = new EventEmitter<number>();
    @Output() cancel = new EventEmitter<void>();

    // TEMPLATE PROPERTIES

    get filteredValues(): FilteredValue[] {
        return this.values.map((value) => this.getFilteredValue(value));
    }

    get selectedItem(): number {
        return this.selection;
    }

    hoveredItem: number = -1;

    // PRIVATE PROPERTIES

    @ViewChild('listbox', { static: true })
    private listBoxRef: ElementRef;

    private focusedItem: number = -1;

    // LIFE CYCLE

    ngOnChanges(changes: SimpleChanges): void {
        const selectionChange = changes['selection'];
        if (selectionChange) {
            const currentValue = changes['selection'].currentValue as number;
            if (currentValue !== this.focusedItem) {
                this.updateFocus(currentValue);
            }
        }
    }

    // EVENT HANDLERS

    onMouseOut(_e: MouseEvent, _index: number): void {
        this.changeHover(-1);
    }

    onMouseOver(_e: MouseEvent, index: number): void {
        this.changeHover(index);
    }

    onClick(e: MouseEvent, index: number): void {
        e.preventDefault();

        this.changeSelection(index);
        this.confirm.emit(index);
    }

    onArrowDown(e: KeyboardEvent): void {
        e.preventDefault();

        if (this.selection < 0 || this.selection >= this.values.length - 1) {
            this.changeSelection(0);
        } else {
            this.changeSelection(this.selection + 1);
        }
    }

    onArrowUp(e: KeyboardEvent): void {
        e.preventDefault();

        if (this.selection <= 0 || this.selection > this.values.length - 1) {
            this.changeSelection(this.values.length - 1);
        } else {
            this.changeSelection(this.selection - 1);
        }
    }

    onEnter(_e: KeyboardEvent): void {
        this.confirm.emit(this.selection);
    }

    onEsc(_e: KeyboardEvent): void {
        this.changeSelection(-1);
        this.cancel.emit();
    }

    // TEMPLATE METHODS

    trackByIndex(index: number): number {
        return index;
    }

    // PRIVATE METHODS

    private getFilteredValue(value: string): FilteredValue {
        const filteredValue: FilteredValue = {
            pre: value,
            filter: '',
            post: ''
        };

        if (this.filter === undefined) {
            return filteredValue;
        }

        const searchIndex = value.toLowerCase().indexOf(this.filter.toLowerCase());
        if (searchIndex !== -1) {
            filteredValue.pre = value.slice(0, searchIndex);
            filteredValue.filter = value.slice(searchIndex, searchIndex + this.filter.length);
            filteredValue.post = value.slice(searchIndex + this.filter.length);
        }
        return filteredValue;
    }

    private changeSelection(index: number): void {
        if (this.selection === index) {
            return;
        }
        this.selection = index;
        this.updateFocus(index);
        this.selectionChange.emit(this.selection);
    }

    private changeHover(index: number): void {
        if (this.hoveredItem === index) {
            return;
        }
        this.hoveredItem = index;
        this.hoverChange.emit(index);
    }

    private updateFocus(index: number): void {
        this.focusedItem = index;
        if (index < 0 || index >= this.values.length) {
            this.focusRelease.emit();
        } else {
            this.listBoxRef.nativeElement.children[index].getElementsByClassName('mibi-focus-item')[0].focus();
            this.focusAcquire.emit();
        }
    }
}
