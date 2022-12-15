import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Faq } from '../faq.model';

@Component({
    selector: 'mibi-faq',
    template: `
        <mibi-faq-view
            [faq]="faq"
            [activeFragment]="activeFragment$ | async"
        ></mibi-faq-view>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqComponent {

    faq: Faq = this.activatedRoute.snapshot.data['faq'];
    activeFragment$ = this.activatedRoute.fragment;

    constructor(private activatedRoute: ActivatedRoute) { }
}
