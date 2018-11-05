import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
    selector: 'mibi-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    supportContact: string = environment.supportContact;

    constructor() { }
}
