import { Directive, ElementRef, Input, OnChanges, OnDestroy } from '@angular/core';
import _ from 'lodash';
import { ToolTip } from './tooltip.model';
import { ToolTipService } from './tooltip.service';

/**
 * Puts tooltips on its host element.
 *
 * Takes any number of them, so one element can carry several tooltips with
 * different themes on different sides -- the samples grid shows a cell's
 * errors, warnings, auto-corrections and previous value that way.
 */
@Directive({
    standalone: false,
    selector: '[mibiToolTip]'
})
export class ToolTipDirective implements OnChanges, OnDestroy {

    @Input('mibiToolTip') toolTips?: ToolTip[] | null;

    /** What is on the element right now, to compare the next list against. */
    private attached: ToolTip[] = [];

    constructor(
        private hostElement: ElementRef<HTMLElement>,
        private toolTipService: ToolTipService
    ) {}

    ngOnChanges(): void {
        const wanted = (this.toolTips ?? []).filter(
            toolTip => toolTip.messages.length > 0
        );

        // Callers build this list in the template, so an unchanged list still
        // arrives as a fresh array on every change detection pass. Comparing by
        // value leaves the tooltips alone instead of tearing them down and
        // building them again, which would shut whichever one is being read.
        if (_.isEqual(wanted, this.attached)) {
            return;
        }

        this.replaceToolTips(wanted);
    }

    ngOnDestroy(): void {
        // tooltipster renders into body, so its instances outlive the element
        // unless they are destroyed with it.
        this.toolTipService.destroy(this.hostElement.nativeElement);
    }

    private replaceToolTips(toolTips: ToolTip[]): void {
        this.toolTipService.destroy(this.hostElement.nativeElement);
        this.toolTipService.attach(this.hostElement.nativeElement, toolTips);
        this.attached = toolTips;
    }
}
