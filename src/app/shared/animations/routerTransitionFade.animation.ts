import {
    trigger,
    animate,
    transition,
    style,
    query
} from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
    transition('* => *', [
        style({ 'position': 'relative' }),

        query(':enter, :leave', [
            style({ 'position': 'absolute', 'left': '0', 'right': '0', 'top': '0', 'bottom': '0' })
        ], { optional: true }),

        query(':enter', [
            style({ 'opacity': '0', 'overflow': 'hidden' })
        ], { optional: true }),

        query(':leave', [
            animate('0.3s', style({ 'opacity': '0' })),
            style({ 'overflow': 'hidden' })
        ], { optional: true }),

        query(':enter', [
            style({ 'overflow': 'auto' }),
            animate('0.3s', style({ 'opacity': '1' }))
        ], { optional: true })
    ])
]);
