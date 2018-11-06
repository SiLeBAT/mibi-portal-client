import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import { UserActionViewModelConfiguration } from '../../../shared/model/user-action.model';
import { takeWhile } from 'rxjs/operators';

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
    constructor(private _changeDetectionRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.config$.pipe(
            takeWhile(() => this.componentActive)
        ).subscribe(config => {
            this.hasConfig = !!config.length;
            this._changeDetectionRef.detectChanges();
        });

    }

    ngOnDestroy() {
        this.componentActive = false;
    }
}
