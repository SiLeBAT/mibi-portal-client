import { Component, Input, OnInit } from '@angular/core';
import { Banner } from '../../model/alert.model';

@Component({
    selector: 'mibi-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

    @Input() banner: Banner;

    constructor() { }
    ngOnInit(): void {
    }
}
