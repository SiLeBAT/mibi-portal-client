import { ElementRef } from '@angular/core';
import { ToolTipDirective } from './tooltip.directive';
import { ToolTipTheme, createToolTip } from './tooltip.model';
import { ToolTipService } from './tooltip.service';

describe('ToolTipDirective', () => {
    let service: { attach: jest.Mock; destroy: jest.Mock };
    let host: HTMLElement;
    let directive: ToolTipDirective;

    /** The tooltips handed to the service by the last attach call. */
    function lastAttached() {
        const calls = service.attach.mock.calls;
        return calls[calls.length - 1]?.[1];
    }

    beforeEach(() => {
        service = { attach: jest.fn(), destroy: jest.fn() };
        host = document.createElement('div');
        directive = new ToolTipDirective(
            new ElementRef(host),
            service as unknown as ToolTipService
        );
    });

    it('attaches the tooltips it is given', () => {
        const error = createToolTip(ToolTipTheme.ERROR, 'top', ['broken']);
        directive.toolTips = [error];

        directive.ngOnChanges();

        expect(service.attach).toHaveBeenCalledTimes(1);
        expect(service.attach).toHaveBeenCalledWith(host, [error]);
    });

    it('leaves out tooltips that have nothing to say', () => {
        const error = createToolTip(ToolTipTheme.ERROR, 'top', ['broken']);
        const empty = createToolTip(ToolTipTheme.WARNING, 'bottom', []);
        directive.toolTips = [error, empty];

        directive.ngOnChanges();

        expect(lastAttached()).toEqual([error]);
    });

    it('attaches nothing when there is no tooltip at all', () => {
        directive.toolTips = [createToolTip(ToolTipTheme.TIP, 'right', [])];

        directive.ngOnChanges();

        expect(service.attach).not.toHaveBeenCalled();
        expect(service.destroy).not.toHaveBeenCalled();
    });

    it('accepts a missing list', () => {
        directive.toolTips = null;

        expect(() => directive.ngOnChanges()).not.toThrow();
        expect(service.attach).not.toHaveBeenCalled();
    });

    it('keeps the tooltips in place when an equal list arrives again', () => {
        // The template rebuilds the list on every change detection pass, so the
        // same tooltips come back as a different array. Re-attaching here would
        // close a tooltip the user is reading.
        directive.toolTips = [createToolTip(ToolTipTheme.ERROR, 'top', ['broken'])];
        directive.ngOnChanges();

        directive.toolTips = [createToolTip(ToolTipTheme.ERROR, 'top', ['broken'])];
        directive.ngOnChanges();

        expect(service.attach).toHaveBeenCalledTimes(1);
        expect(service.destroy).toHaveBeenCalledTimes(1);
    });

    it('replaces the tooltips when the messages change', () => {
        directive.toolTips = [createToolTip(ToolTipTheme.ERROR, 'top', ['broken'])];
        directive.ngOnChanges();

        directive.toolTips = [createToolTip(ToolTipTheme.ERROR, 'top', ['still broken'])];
        directive.ngOnChanges();

        expect(service.attach).toHaveBeenCalledTimes(2);
        expect(lastAttached()).toEqual([
            createToolTip(ToolTipTheme.ERROR, 'top', ['still broken'])
        ]);
    });

    it('replaces the tooltips when only the theme changes', () => {
        directive.toolTips = [createToolTip(ToolTipTheme.WARNING, 'top', ['look'])];
        directive.ngOnChanges();

        directive.toolTips = [createToolTip(ToolTipTheme.ERROR, 'top', ['look'])];
        directive.ngOnChanges();

        expect(service.attach).toHaveBeenCalledTimes(2);
    });

    it('removes the tooltips once they are no longer wanted', () => {
        directive.toolTips = [createToolTip(ToolTipTheme.ERROR, 'top', ['broken'])];
        directive.ngOnChanges();
        service.attach.mockClear();

        directive.toolTips = [];
        directive.ngOnChanges();

        expect(service.destroy).toHaveBeenCalledWith(host);
        expect(lastAttached()).toEqual([]);
    });

    it('cleans up when the element goes away', () => {
        // tooltipster renders into body, so its instances would outlive the host.
        directive.ngOnDestroy();

        expect(service.destroy).toHaveBeenCalledWith(host);
    });
});
