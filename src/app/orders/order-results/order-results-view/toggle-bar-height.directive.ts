import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from '@angular/core';

/**
 * Keeps the toggle column's label readable regardless of table height:
 *  - exposes the inner grid's rendered height as `--mibi-toggle-bar-height`
 *    (used by the label's CSS `max-height`), and
 *  - manually truncates the label with a trailing " …" when it doesn't fit
 *    (native `text-overflow` custom strings aren't supported in Chromium/Safari).
 * The full text is kept in the label's `title` (tooltip).
 */
@Directive({
    standalone: false,
    selector: '[mibiToggleBarHeight]'
})
export class ToggleBarHeightDirective implements AfterViewInit, OnDestroy {

    private static readonly ELLIPSIS = ' ...';

    private observer?: ResizeObserver;

    constructor(
        private readonly el: ElementRef<HTMLElement>,
        private readonly zone: NgZone
    ) {}

    ngAfterViewInit(): void {
        const grid = this.el.nativeElement.querySelector<HTMLElement>('.mibi-grid');
        if (!grid) {
            return;
        }
        this.zone.runOutsideAngular(() => {
            this.observer = new ResizeObserver(() => {
                const height = grid.getBoundingClientRect().height;
                this.el.nativeElement.style.setProperty('--mibi-toggle-bar-height', `${height}px`);
                this.truncateLabel();
            });
            this.observer.observe(grid);
        });
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }

    // Shortens the vertical label to the largest prefix that fits the available
    // (CSS max-height driven) space, appending " …". Reads the full text from the
    // title so it can re-expand when the table grows.
    private truncateLabel(): void {
        const label = this.el.nativeElement.querySelector<HTMLElement>('.mibi-toggle-cell__label');
        if (!label) {
            return;
        }
        const full = label.getAttribute('title') ?? '';
        label.textContent = full;
        if (label.scrollHeight <= label.clientHeight) {
            return;
        }

        let low = 0;
        let high = full.length;
        while (low < high) {
            const mid = Math.ceil((low + high) / 2);
            label.textContent = full.slice(0, mid).replace(/\s+$/, '') + ToggleBarHeightDirective.ELLIPSIS;
            if (label.scrollHeight <= label.clientHeight) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }
        label.textContent = full.slice(0, low).replace(/\s+$/, '') + ToggleBarHeightDirective.ELLIPSIS;
    }
}
