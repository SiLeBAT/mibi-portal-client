import { trigger, animate, transition, style, query } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
    transition('* => *', [
        style({ 'opacity': '0.0' }),
        animate('0.3s 0.1s', style({ 'opacity': '1' }))
    ])
]);

export const transitionAnimation = trigger('transitionAnimation', [
    transition('* => *', [
        query(':leave, :enter', [
            style({ 'display': 'none' })
        ], { optional: true }),

        query(':enter', [
            animate('0.1s'),
            style({ 'display': 'block', 'height': '100%', 'width': '100%' })
        ], { optional: true })
    ])
]);
