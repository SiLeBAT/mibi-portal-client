import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SamplesMainSlice } from '../../../samples/samples.state';
import { selectHasEntries } from '../../../samples/state/samples.selectors';

@Component({
    selector: 'mibi-nav-bar-container',
    template: `<mibi-nav-bar
    [hasEntries$]="hasEntries$">
    </mibi-nav-bar>`
})
export class NavBarContainerComponent implements OnInit {

    hasEntries$: Observable<boolean>;

    constructor(
        private store$: Store<SamplesMainSlice>) { }

    ngOnInit() {
        this.hasEntries$ = this.store$.pipe(select(selectHasEntries));
    }
}
