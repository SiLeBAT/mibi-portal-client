import { trigger, animate, transition, style, query, state, keyframes, sequence, group } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
    transition('noRoute => *', []),
    transition('* => samples', [
        animate('0.3s', style({ 'opacity': '0' })),
        animate('0.1s', style({ 'opacity': '0' }))
    ]),
    transition('samples => *', [
        style({ 'opacity': '0' }),
        animate('0.3s', style({ 'opacity': '1' }))
    ]),
    transition('* => *', [
        animate('0.3s', style({ 'opacity': '0' })),
        animate('0.3s', style({ 'opacity': '1' }))
    ])
]);

export const transitionAnimation = trigger('transitionAnimation', [
    transition('noRoute => *', []),
    transition('samples => *', []),
    transition('* => *', [
        query(':leave, :enter', [
            style({ 'display': 'none' })
        ], { optional: true }),

        group([
            query(':leave', [
                style({ 'display': 'block' }),
                animate('0.3s'),
                style({ 'display': 'none' })
            ], { optional: true }),

            query(':enter', [
                animate('0.3s'),
                style({ 'display': 'block' })
            ], { optional: true })
        ])

    ])
]);
