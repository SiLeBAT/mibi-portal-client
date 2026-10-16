import { Injectable } from '@angular/core';
import 'tooltipster';
import { ToolTip, ToolTipTheme, hasToolTipContent } from './tooltip.model';

/**
 * The only place in the application that talks to tooltipster.
 *
 * tooltipster is a jQuery plugin: it is loaded as a global script (see the
 * `scripts` entry in angular.json) and it renders its tooltips into `body`,
 * outside the Angular component tree. Keeping every `$(...)` call here means
 * the rest of the code describes tooltips through `ToolTip` alone, and that
 * replacing the library touches this file and `tooltip.scss` only.
 */
@Injectable({
    providedIn: 'root'
})
export class ToolTipService {

    /** tooltipster picks its colours from a theme class; ours live in tooltip.scss. */
    private readonly themeClasses: Record<ToolTipTheme, string> = {
        [ToolTipTheme.WARNING]: 'tooltipster-warning',
        [ToolTipTheme.ERROR]: 'tooltipster-error',
        [ToolTipTheme.INFO]: 'tooltipster-info',
        [ToolTipTheme.TIP]: 'tooltipster-tip',
        [ToolTipTheme.NRL]: 'tooltipster-nrl'
    };

    /**
     * Attaches one tooltip per entry to the element. Entries without a title
     * or messages are skipped, so callers can hand over a fixed set of themes and leave the
     * ones that have nothing to say empty.
     */
    attach(element: HTMLElement, toolTips: ToolTip[]): void {
        toolTips
            .filter(toolTip => hasToolTipContent(toolTip))
            .forEach(toolTip => {
                $(element).tooltipster(this.toOptions(toolTip));
            });
    }

    /** Removes every tooltip this service put on the element. */
    destroy(element: HTMLElement): void {
        $.tooltipster.instances(element).forEach(instance => instance.destroy());
    }

    private toOptions(toolTip: ToolTip): JQueryTooltipster.ITooltipsterOptions {
        return {
            repositionOnScroll: true,
            animation: 'grow',
            delay: 0,
            theme: this.themeClasses[toolTip.theme],
            touchDevices: false,
            trigger: 'hover',
            contentAsHTML: true,
            content: this.toHtml(toolTip),
            side: toolTip.alignment,
            // Several tooltips, each with its own theme and side, share one element.
            multiple: true
        };
    }

    private toHtml(toolTip: ToolTip): string {
        // The titled layout (tooltip.scss) keeps the title on one line and wraps
        // the messages to the title's width, or to a bounded width if wider.
        if (toolTip.title) {
            const lines = toolTip.messages.map(message => `<div>${message}</div>`).join('');
            return '<div class="mibi-tool-tip-titled">'
                + `<strong class="mibi-tool-tip-titled__title">${toolTip.title}</strong>${lines}</div>`;
        }
        return `<ul>${toolTip.messages.map(message => `<li>${message}</li>`).join('')}</ul>`;
    }
}
