import { trigger, animate, transition, style, query, group } from '@angular/animations';

// 0.3s fade to opacity:0, then 0.3s fade to opacity:1
export const routerTransitionFadeAnimation = trigger('routerTransitionFadeAnimation', [
    transition('initial => *', []),
    transition('* => disabled', [
        animate('0.3s', style({ 'opacity': '0' })),
        animate('0.1s', style({ 'opacity': '0' }))
    ]),
    transition('disabled => *', [
        style({ 'opacity': '0' }),
        animate('0.3s', style({ 'opacity': '1' }))
    ]),
    transition('* => *', [
        animate('0.3s', style({ 'opacity': '0' })),
        animate('0.3s', style({ 'opacity': '1' }))
    ])
]);

// cross-fade: leaving route fades out, entering route fades in
export const routerTransitionAnimation = trigger('routerTransitionAnimation', [
    transition('initial => *', []),
    transition('disabled => *', []),
    transition('* => *', [
        query(':enter', [
            style({ 'opacity': '0' })
        ], { optional: true }),

        group([
            query(':leave', [
                animate('0.3s', style({ 'opacity': '0' }))
            ], { optional: true }),

            query(':enter', [
                animate('0.3s', style({ 'opacity': '1' }))
            ], { optional: true })
        ])
    ])
]);
