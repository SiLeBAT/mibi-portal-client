import {
    trigger, state, style, transition, animate
} from '@angular/animations';

export const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('out', style({
            'display' : 'none',
            'transform': 'translate(-50%, -110%)'
        })),
        transition('in => out', [
            animate('400ms ease-in-out', style({
                'transform': 'translate(-50%, -110%)'
            }))
        ]),
        transition('out => in', [
            style({
                'display': 'block'
            }),
            animate('400ms ease-in-out', style({
                'transform': 'translate(-50%, 0)'
            }))
        ])
    ])
];
