import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import { UserActionViewModelConfiguration } from '../../../shared/model/user-action.model';
import { takeWhile, startWith, tap, delay } from 'rxjs/operators';

@Component({
    selector: 'mibi-app-bar-top',
    templateUrl: './app-bar-top.component.html',
    styleUrls: ['./app-bar-top.component.scss']
})
export class AppBarTopComponent implements OnInit, OnDestroy {
    @Input() currentUser$: Observable<User | null>;
    @Input() appName: string;
    @Input() config$: Observable<UserActionViewModelConfiguration[]>;
    private componentActive = true;
    hasConfig = false;
    constructor() { }

    ngOnInit(): void {
        this.config$.pipe(
            startWith([]),
            delay(0),
            takeWhile(() => this.componentActive),
            tap(config => {
                this.hasConfig = !!config.length;
            })).subscribe();

    }

    ngOnDestroy() {
        this.componentActive = false;
    }
}
