import { ToolTipTheme, createToolTip } from './tooltip.model';
import { ToolTipService } from './tooltip.service';

type Globals = Record<string, unknown>;

describe('ToolTipService', () => {
    let tooltipster: jest.Mock;
    let instances: jest.Mock;
    let jqueryFor: jest.Mock;
    let service: ToolTipService;
    let element: HTMLElement;
    let originalJQuery: unknown;

    beforeEach(() => {
        tooltipster = jest.fn();
        instances = jest.fn(() => []);
        jqueryFor = jest.fn(() => ({ tooltipster: tooltipster }));
        const jquery = jqueryFor as unknown as Globals;
        jquery['tooltipster'] = { instances: instances };

        originalJQuery = (globalThis as Globals)['$'];
        (globalThis as Globals)['$'] = jquery;

        service = new ToolTipService();
        element = document.createElement('div');
    });

    afterEach(() => {
        (globalThis as Globals)['$'] = originalJQuery;
    });

    /** The options passed to tooltipster by the n-th attach. */
    function optionsOf(index: number): JQueryTooltipster.ITooltipsterOptions {
        const call = tooltipster.mock.calls[index];
        if (!call) {
            throw new Error(`tooltipster was not called ${index + 1} time(s)`);
        }
        return call[0];
    }

    it('attaches the tooltip to the element it was given', () => {
        service.attach(element, [
            createToolTip(ToolTipTheme.ERROR, 'top', ['broken'])
        ]);

        expect(jqueryFor).toHaveBeenCalledWith(element);
        expect(tooltipster).toHaveBeenCalledTimes(1);
    });

    it.each([
        [ToolTipTheme.WARNING, 'tooltipster-warning'],
        [ToolTipTheme.ERROR, 'tooltipster-error'],
        [ToolTipTheme.INFO, 'tooltipster-info'],
        [ToolTipTheme.TIP, 'tooltipster-tip'],
        [ToolTipTheme.NRL, 'tooltipster-nrl']
    ])('renders the %s theme with the tooltipster class %s', (theme, expected) => {
        service.attach(element, [createToolTip(theme, 'top', ['a message'])]);

        expect(optionsOf(0).theme).toBe(expected);
    });

    it('shows the messages as a bullet list', () => {
        service.attach(element, [
            createToolTip(ToolTipTheme.ERROR, 'top', ['first', 'second'])
        ]);

        expect(optionsOf(0).content).toBe('<ul><li>first</li><li>second</li></ul>');
        expect(optionsOf(0).contentAsHTML).toBe(true);
    });

    it('shows a title in bold with the messages as plain lines below it', () => {
        service.attach(element, [
            createToolTip(ToolTipTheme.NRL, 'bottom', ['first', 'second'], 'Heading')
        ]);

        expect(optionsOf(0).content).toBe(
            '<div class="mibi-tool-tip-titled"><strong class="mibi-tool-tip-titled__title">Heading</strong>'
            + '<div>first</div><div>second</div></div>'
        );
    });

    it('attaches a tooltip that has a title but no messages', () => {
        service.attach(element, [createToolTip(ToolTipTheme.NRL, 'bottom', [], 'Heading')]);

        expect(optionsOf(0).content).toBe(
            '<div class="mibi-tool-tip-titled"><strong class="mibi-tool-tip-titled__title">Heading</strong></div>'
        );
    });

    // The width of a titled tooltip is left to its CSS layout, which keeps the
    // title on one line; a tooltipster maxWidth would wrap it again.
    it('sets no tooltipster width limit', () => {
        service.attach(element, [createToolTip(ToolTipTheme.NRL, 'bottom', ['a message'], 'Heading')]);

        expect(optionsOf(0).maxWidth).toBeUndefined();
    });

    it('puts the tooltip on the side it asked for', () => {
        service.attach(element, [
            createToolTip(ToolTipTheme.TIP, 'right', ['a message'])
        ]);

        expect(optionsOf(0).side).toBe('right');
    });

    it('lets one element carry several tooltips at once', () => {
        service.attach(element, [
            createToolTip(ToolTipTheme.ERROR, 'top', ['broken']),
            createToolTip(ToolTipTheme.WARNING, 'bottom', ['odd'])
        ]);

        expect(tooltipster).toHaveBeenCalledTimes(2);
        expect(optionsOf(0).multiple).toBe(true);
        expect(optionsOf(1).multiple).toBe(true);
        expect(optionsOf(0).side).toBe('top');
        expect(optionsOf(1).side).toBe('bottom');
    });

    it('attaches nothing for a tooltip without messages', () => {
        service.attach(element, [
            createToolTip(ToolTipTheme.ERROR, 'top', []),
            createToolTip(ToolTipTheme.WARNING, 'bottom', ['odd'])
        ]);

        expect(tooltipster).toHaveBeenCalledTimes(1);
        expect(optionsOf(0).theme).toBe('tooltipster-warning');
    });

    it('destroys every tooltip on the element', () => {
        const first = { destroy: jest.fn() };
        const second = { destroy: jest.fn() };
        instances.mockReturnValue([first, second]);

        service.destroy(element);

        expect(instances).toHaveBeenCalledWith(element);
        expect(first.destroy).toHaveBeenCalled();
        expect(second.destroy).toHaveBeenCalled();
    });
});
