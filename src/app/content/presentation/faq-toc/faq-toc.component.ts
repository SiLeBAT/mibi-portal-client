import { Component, OnInit, Input } from '@angular/core';
import { IFAQGroup } from '../faq-section/faq-section.component';

interface IFAQTocEntry {
    title: string;
    id: string;
    count: number;
}
@Component({
    selector: 'mibi-faq-toc',
    templateUrl: './faq-toc.component.html',
    styleUrls: ['./faq-toc.component.scss']
})
export class FAQTocComponent implements OnInit {

    @Input() faqCollection: IFAQGroup[];

    faqTocEntries: IFAQTocEntry[] = [];

    ngOnInit(): void {
        this.faqTocEntries = this.faqCollection.filter((faqGroup: IFAQGroup) => !!faqGroup.title).map((faqGroup: IFAQGroup) => ({
            title: faqGroup.title.toUpperCase(),
            id: faqGroup.id,
            count: faqGroup.faqs.length
        }));
    }
}
