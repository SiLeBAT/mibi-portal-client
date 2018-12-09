import { Component, SecurityContext, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface IFAQ {
    a: string;
    q: string;
}

@Component({
    selector: 'mibi-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss']
})
export class FAQComponent implements OnInit {

    @Input() faqs: IFAQ;
    question: SafeHtml;
    answer: SafeHtml;
    constructor(private sanitizer: DomSanitizer) { }

    ngOnInit() {

        this.question = this.sanitize(this.faqs.q) || '';
        this.answer = this.sanitize(this.faqs.a) || '';
    }

    sanitize(input: string): string | null {
        return this.sanitizer.sanitize(SecurityContext.HTML, input);
    }
}
