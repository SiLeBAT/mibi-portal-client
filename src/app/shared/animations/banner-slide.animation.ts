import {
    trigger, state, style, transition, animate
} from '@angular/animations';

export const bannerSlideAnimation = [
    trigger('bannerSlideAnimation', [
        state('out', style({
            'visibility': 'hidden',
            'transform': 'translate(-50%, -110%)'
        })),
        transition('in => out', [
            animate('400ms ease-in-out', style({
                'transform': 'translate(-50%, -110%)'
            }))
        ]),
        transition('out => in', [
            style({
                'visibility': 'visible'
            }),
            animate('400ms ease-in-out', style({
                'transform': 'translate(-50%, 0)'
            }))
        ])
    ])
];
