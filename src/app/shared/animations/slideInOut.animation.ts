import {
    trigger, state, style, transition,
    animate, group
} from '@angular/animations';

export const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('in', style({
            'max-height': '100%', 'opacity': '1'
        })),
        state('out', style({
            'max-height': '0px', 'opacity': '0'
        })),
        transition('in => out', [group([
            animate('400ms ease-in-out', style({
                'max-height': '0px',
                'opacity': '0'
            }))
        ]
        )]),
        transition('out => in', [group([
            animate('400ms ease-in-out', style({
                'max-height': '100%',
                'opacity': '1'
            }))
        ]
        )])
    ])
];
