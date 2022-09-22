import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { IFAQGroup } from '../faq-section/faq-section.component';
import { ActivatedRoute } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { ClientError } from '../../../core/model/client-error';

@Component({
    selector: 'mibi-faq-view',
    templateUrl: './faq-view.component.html',
    styleUrls: ['./faq-view.component.scss']
})
export class FAQViewComponent implements OnInit, AfterViewChecked, OnDestroy {

    faqCollection: IFAQGroup[] = [];
    private fragment: string | null;
    private componentActive = true;

    constructor(private activatedRoute: ActivatedRoute) { }
    ngOnInit(): void {
        this.faqCollection = this.activatedRoute.snapshot.data['faqCollection'];
        this.activatedRoute.fragment.pipe(
            takeWhile(() => this.componentActive)
        ).subscribe(fragment => { this.fragment = fragment; }, (error) => {
            throw new ClientError(`Can't retrieve view fragment. error=${error}`);
        });
    }

    ngAfterViewChecked(): void {
        try {
            if (this.fragment !== null) {
                const element = document.querySelector('#' + this.fragment);
                if (element) {
                    element.scrollIntoView();
                    this.fragment = null;
                }
            }
        // eslint-disable-next-line no-empty
        } catch {
        }
    }

    ngOnDestroy() {
        this.componentActive = false;
    }
}
