import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MainMainSlice } from '../main.state';
import { selectActionBarEnabled } from '../state/action-bar.selectors';

/**
 * Page header: the navigation bar, with the action bar below it when a feature
 * has configured one.
 */
@Component({
    standalone: false,
    selector: 'mibi-app-bar-top',
    templateUrl: './app-bar-top.component.html',
    styleUrls: ['./app-bar-top.component.scss']
})
export class AppBarTopComponent {

    actionBarEnabled$: Observable<boolean> = this.store$.select(selectActionBarEnabled);

    constructor(private store$: Store<MainMainSlice>) {}
}
