import { Component, Input, EventEmitter, Output } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { bannerSlideAnimation } from '../../../shared/animations/banner-slide.animation';
import { routerTransitionFadeAnimation, routerTransitionAnimation } from '../../../shared/animations/router-transition.animation';
import { RouterOutlet } from '@angular/router';
import { AnimationsRouteData } from '../../../shared/animations/animations.model';

@Component({
    selector: 'mibi-page-body',
    templateUrl: './page-body.component.html',
    styleUrls: ['./page-body.component.scss'],
    animations: [bannerSlideAnimation, routerTransitionFadeAnimation, routerTransitionAnimation]
})
export class PageBodyComponent {
    @Input() isBusy: boolean;
    @Input() isBanner: boolean;
    @Output() animationDone = new EventEmitter<void>();

    getBannerAnimationState(): string {
        return this.isBanner ? 'in' : 'out';
    }

    getRouterAnimationState(outlet: RouterOutlet): string {
        if(!outlet.isActivated) {
            return 'initial';
        }

        const outletData = outlet.activatedRoute.snapshot.data as AnimationsRouteData;

        if(outletData.transitionAnimation === 'disabled') {
            return 'disabled';
        }

        return outlet.activatedRoute.snapshot.url[0]?.path ?? '';
    }

    onBannerAnimationDone(event: AnimationEvent) {
        if (event.fromState === 'in') {
            this.animationDone.emit();
        }
    }

    onRouterTransitionAnimationDone(scrollContainer: {scrollTop: number; scrollLeft: number}): void {
        scrollContainer.scrollTop = 0;
        scrollContainer.scrollLeft = 0;
    }
}
