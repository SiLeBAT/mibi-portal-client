import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'mibi-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
    @Input() name: string;
    @Input() loadingImage: string;

    private isShowing = false;

    constructor() { }

    @Output() showChange = new EventEmitter();

    @Input()
    get show(): boolean {
        return this.isShowing;
    }

    set show(val: boolean) {
        this.isShowing = val;
        this.showChange.emit(this.isShowing);
    }
}
