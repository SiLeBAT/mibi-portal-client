import {
    Component,
    Input, OnInit, AfterViewInit, Output, EventEmitter
} from '@angular/core';
import { Banner } from '../../model/alert.model';

@Component({
    selector: 'mibi-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, AfterViewInit {

    @Input() banner: Banner;
    @Output() mainAction = new EventEmitter();
    @Output() auxilliaryAction = new EventEmitter();
    constructor() { }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {

    }

    onMainAction() {
        this.mainAction.emit();
    }

    onAuxAction() {
        this.auxilliaryAction.emit();
    }
}
