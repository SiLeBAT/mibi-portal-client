import { Component, Input } from '@angular/core';
import { IFAQ } from '../faq/faq.component';

export interface IFAQGroup {
    title: string;
    id: string;
    faqs: IFAQ[];
}
@Component({
    selector: 'mibi-faq-section',
    templateUrl: './faq-section.component.html',
    styleUrls: ['./faq-section.component.scss']
})
export class FAQSectionComponent {

    @Input() faqGroup: IFAQGroup;
    constructor() { }

}
