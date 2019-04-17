import {
    trigger, state, style, transition,
    animate, group
} from '@angular/animations';

export const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('in', style({
        })),
        state('out', style({
            // only display: none doesnt work with safari
            // 'display' : 'none',
            'visibility' : 'hidden',
            'overflow': 'hidden',
            'max-height': '0'
        })),
        transition('in => out', [group([
            style({
                'overflow': 'hidden',
                'max-height': '100vh'
            }),
            animate('400ms ease-in-out', style({
                'max-height': '0',
                'overflow': 'hidden',
                'opacity': '0'
            }))
        ]
        )]),
        transition('* => in', [group([
            style({
                'visibility' : 'visible',
                'overflow': 'hidden',
                'max-height': '0',
                'opacity': '0'
            }),
            animate('400ms ease-in-out', style({
                'visibility' : 'visible',
                'max-height': '100vh',
                'overflow': 'hidden',
                'opacity': '1'
            }))
        ]
        )])
    ])
];
