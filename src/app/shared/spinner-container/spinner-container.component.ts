import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { LoadingSpinnerService } from '../services/loading-spinner.service';

@Component({
    selector: 'app-spinner-container',
    templateUrl: './spinner-container.component.html'
})
export class SpinnerContainerComponent implements OnInit, OnDestroy {
    @Input() name: string;
    @Input() loadingImage: string;

    private isShowing = false;

    constructor(private spinnerService: LoadingSpinnerService) { }

    @Output() showChange = new EventEmitter();

    @Input()
    get show(): boolean {
        return this.isShowing;
    }

    set show(val: boolean) {
        this.isShowing = val;
        this.showChange.emit(this.isShowing);
    }

    ngOnInit() {
        if (!this.name) {
            throw new Error('Spinner must have a "name" attribute.');
        }
        this.spinnerService._register(this);
    }

    ngOnDestroy(): void {
        this.spinnerService._unregister(this);
    }

}
