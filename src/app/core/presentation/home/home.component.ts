import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'mibi-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    appName: string = environment.appName;
    supportContact: string = environment.supportContact;

}
