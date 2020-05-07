import { Component, Input, EventEmitter, Output } from '@angular/core';
import { SlideInOutAnimation } from '../../../shared/animations/slideInOut.animation';
import { fadeAnimation, transitionAnimation } from '../../../shared/animations/routerTransitionFade.animation';

@Component({
    selector: 'mibi-page-body',
    templateUrl: './page-body.component.html',
    styleUrls: ['./page-body.component.scss'],
    animations: [SlideInOutAnimation, fadeAnimation, transitionAnimation]
})
export class PageBodyComponent {
    @Input() isBusy: boolean;
    @Input() isBanner: boolean;
    @Output() onAnimationDone = new EventEmitter<void>();

    get animationState(): string {
        return this.isBanner ? 'in' : 'out';
    }

    animationDone(event: any) {
        if (event.fromState === 'in') {
            this.onAnimationDone.emit();
        }
    }
}
