import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'mibi-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    appName: string = environment.appName;
    supportContact: string = environment.supportContact;
    isAlternativeWelcomePage: boolean;

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.isAlternativeWelcomePage = this.route.snapshot.data['isAlternativeWelcomePage'];
    }

}
