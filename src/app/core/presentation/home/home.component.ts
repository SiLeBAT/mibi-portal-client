import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { selectWelcomePageContent, selectWelcomePageIsMaintenance } from '../../state/core.selectors';

@Component({
    standalone: false,
    selector: 'mibi-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    appName: string = environment.appName;
    supportContact: string = environment.supportContact;
    isAlternativeWelcomePage: boolean;
    isMaintenance$: Observable<boolean>;
    maintenanceContent$: Observable<string>;

    constructor(private route: ActivatedRoute, private store$: Store) {}

    ngOnInit() {
        this.isAlternativeWelcomePage = this.route.snapshot.data['isAlternativeWelcomePage'];
        this.isMaintenance$ = this.store$.select(selectWelcomePageIsMaintenance);
        this.maintenanceContent$ = this.store$.select(selectWelcomePageContent);
    }
}
