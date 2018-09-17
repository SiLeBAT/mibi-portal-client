import { Component } from '@angular/core';

import { environment } from '../environments/environment';

@Component({
    selector: 'mibi-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    private isActive = false;
    supportContact: string = environment.supportContact;

    constructor() { }

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
