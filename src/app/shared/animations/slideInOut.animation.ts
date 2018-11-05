import {
    trigger, state, style, transition,
    animate, group
} from '@angular/animations';

export const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('in', style({
            'max-height': '100%', 'opacity': '1', 'visibility': 'visible'
        })),
        state('out', style({
            'max-height': '0px', 'opacity': '1', 'visibility': 'visible'
        })),
        transition('in => out', [group([
            animate('400ms ease-in-out', style({
                'max-height': '0px'
            }))
        ]
        )]),
        transition('out => in', [group([
            animate('400ms ease-in-out', style({
                'max-height': '100%'
            }))
        ]
        )])
    ])
];
