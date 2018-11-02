import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import {
    trigger, state, style, transition,
    animate, group
} from '@angular/animations';
import { takeWhile } from 'rxjs/operators';

const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('in', style({
            'max-height': '100%', 'opacity': '1', 'visibility': 'visible'
        })),
        state('out', style({
            'max-height': '0px', 'opacity': '1', 'visibility': 'visible'
        })),
        transition('in => out', [group([
            animate('600ms ease-in-out', style({
                'max-height': '0px'
            }))
        ]
        )]),
        transition('out => in', [group([
            animate('600ms ease-in-out', style({
                'max-height': '100%'
            }))
        ]
        )])
    ])
];

@Component({
    selector: 'mibi-page-body',
    templateUrl: './page-body.component.html',
    styleUrls: ['./page-body.component.scss'],
    animations: [SlideInOutAnimation]
})
export class PageBodyComponent implements OnInit, OnDestroy {
    @Input() isBusy$: Observable<boolean>;
    @Input() isBanner$: Observable<boolean>;
    private componentActive = true;
    animationState = 'out';
    constructor() {
    }

    ngOnInit(): void {
        this.isBanner$.pipe(takeWhile(() => this.componentActive)
        ).subscribe(
            b => {
                if (b) {
                    this.animationState = 'in';
                } else {
                    this.animationState = 'out';
                }
            }
        );
    }

    ngOnDestroy() {
        this.componentActive = false;
    }
}
