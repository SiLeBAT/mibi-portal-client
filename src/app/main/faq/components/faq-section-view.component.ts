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
}
