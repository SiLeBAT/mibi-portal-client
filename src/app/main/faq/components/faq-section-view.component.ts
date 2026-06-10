import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FaqEntry } from '../faq.model';

@Component({
    standalone: false,
    selector: 'mibi-faq-section-view',
    templateUrl: './faq-section-view.component.html',
    styleUrls: ['./faq-section-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqSectionViewComponent {

    @Input() title?: string;
    @Input() entries: FaqEntry[];

    onAnswerClick(event: MouseEvent): void {
        const anchor = (event.target as HTMLElement).closest('a');
        if (!anchor) { return; }

        let href = anchor.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('/')) { return; }

        const isValidHref = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:');

        if (!isValidHref) {
            // href is a placeholder (e.g. "link") — use the visible text if it looks like a URL
            const text = (anchor.textContent || '').trim();
            const textIsUrl = text.startsWith('http://') || text.startsWith('https://') || (text.includes('.') && !text.includes(' '));
            if (textIsUrl) {
                href = text.startsWith('http') ? text : 'https://' + text;
            } else if (href.includes('.')) {
                href = 'https://' + href;
            } else {
                return;
            }
            anchor.setAttribute('href', href);
        }

        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
    }
}
