import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'mibi-footer-nav',
    templateUrl: './footer-nav.component.html',
    styleUrls: ['./footer-nav.component.scss']
})
export class FooterNavComponent implements OnInit {

    @Input() supportContact: string;

    constructor() { }

    ngOnInit() {
    }

}
