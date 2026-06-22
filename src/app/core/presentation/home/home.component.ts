import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    selectIsAlternativeWelcomePage,
    selectWelcomePageContent,
    selectWelcomePageIsMaintenance
} from '../../state/core.selectors';

@Component({
    standalone: false,
    selector: 'mibi-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    supportContact: string = environment.supportContact;
    isAlternativeWelcomePage$: Observable<boolean>;
    isMaintenance$: Observable<boolean>;
    maintenanceContent$: Observable<string>;

    constructor(private store$: Store) {}

    ngOnInit() {
        // Read from the store (not the route) so this welcome block can be
        // embedded inside the upload page without its own resolver.
        this.isAlternativeWelcomePage$ = this.store$.select(selectIsAlternativeWelcomePage);
        this.isMaintenance$ = this.store$.select(selectWelcomePageIsMaintenance);
        this.maintenanceContent$ = this.store$.select(selectWelcomePageContent);
    }
}
