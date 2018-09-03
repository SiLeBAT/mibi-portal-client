import { Component, OnInit } from '@angular/core';

import { environment } from '../environments/environment';

@Component({
    selector: 'mibi-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private isActive = false;
    supportContact: string = environment.supportContact;

    constructor() { }

    ngOnInit() { }

    getDisplayMode() {
        let displayMode;
        if (this.isActive) {
            displayMode = 'block';
        } else {
            displayMode = 'none';
        }

        return displayMode;
    }
}
