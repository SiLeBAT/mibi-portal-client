import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { takeWhile, startWith, tap, delay } from 'rxjs/operators';
import { SlideInOutAnimation } from '../../../shared/animations/slideInOut.animation';
import { fadeAnimation } from '../../../shared/animations/routerTransitionFade.animation';

@Component({
    selector: 'mibi-page-body',
    templateUrl: './page-body.component.html',
    styleUrls: ['./page-body.component.scss'],
    animations: [SlideInOutAnimation, fadeAnimation]
})
export class PageBodyComponent implements OnInit, OnDestroy {
    @Input() isBusy$: Observable<boolean>;
    @Input() isBanner$: Observable<boolean>;
    private componentActive = true;
    animationState = 'out';
    @Output() onAnimationDone = new EventEmitter();
    constructor() {
    }

    ngOnInit(): void {
        this.isBanner$.pipe(
            startWith([]),
            delay(0),
            takeWhile(() => this.componentActive),
            tap(showBanner => {
                if (showBanner) {
                    this.animationState = 'in';

                } else {
                    this.animationState = 'out';
                }
            })).subscribe();
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    animationDone(event: any) {
        if (event.fromState === 'in') {
            this.onAnimationDone.emit(event);
        }

        // window.dispatchEvent(new Event('resize'));
    }
}
