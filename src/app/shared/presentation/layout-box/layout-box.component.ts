import { Component, OnInit, Input } from '@angular/core';

export enum OverflowHandlingValues { 'enabled', 'disabled' }

@Component({
    selector: 'mibi-layout-box',
    templateUrl: './layout-box.component.html',
    styleUrls: ['./layout-box.component.scss']
})
export class LayoutBoxComponent implements OnInit {

    private _xOverflowHandling: string;

    @Input('x-overflow-handling')
    get xOverflowHandling(): string {
        return this._xOverflowHandling;
    }
    set xOverflowHandling(val: string) {
        if (val in OverflowHandlingValues) {
            this._xOverflowHandling = val;
        }
    }

    private _yOverflowHandling: string;

    @Input('y-overflow-handling')
    get yOverflowHandling(): string {
        return this._yOverflowHandling;
    }
    set yOverflowHandling(val: string) {
        if (val in OverflowHandlingValues) {
            this._yOverflowHandling = val;
        }
    }

    constructor() {
        this.xOverflowHandling = 'disabled';
        this.yOverflowHandling = 'disabled';
    }

    ngOnInit() {
    }

}
