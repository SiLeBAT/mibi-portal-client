import { Component, Input, EventEmitter, Output } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { slideInOutAnimation } from '../../../shared/animations/slide-in-out.animation';
import { fadeAnimation, transitionAnimation } from '../../../shared/animations/router-transition-fade.animation';

@Component({
    selector: 'mibi-page-body',
    templateUrl: './page-body.component.html',
    styleUrls: ['./page-body.component.scss'],
    animations: [slideInOutAnimation, fadeAnimation, transitionAnimation]
})
export class PageBodyComponent {
    @Input() isBusy: boolean;
    @Input() isBanner: boolean;
    @Output() onAnimationDone = new EventEmitter<void>();

    get animationState(): string {
        return this.isBanner ? 'in' : 'out';
    }

    animationDone(event: AnimationEvent) {
        if (event.fromState === 'in') {
            this.onAnimationDone.emit();
        }
    }
}
