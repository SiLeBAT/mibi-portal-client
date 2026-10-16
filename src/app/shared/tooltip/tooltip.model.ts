/**
 * What a tooltip says and how it looks. Nothing here names the library that
 * renders it: the mapping onto tooltipster lives in `tooltip.service.ts`, so
 * callers describe tooltips and never reach for the library themselves.
 */

export enum ToolTipTheme {
    WARNING = 'warning',
    ERROR = 'error',
    INFO = 'info',
    TIP = 'tip',
    NRL = 'nrl'
}

export type ToolTipAlignment = 'bottom' | 'top' | 'left' | 'right';

export interface ToolTip {
    theme: ToolTipTheme;
    alignment: ToolTipAlignment;
    /** One bullet per entry. An empty list means there is nothing to show. */
    messages: string[];
    /**
     * A heading in bold above the messages. A tooltip with a title shows its
     * messages as plain lines below it instead of bullets.
     */
    title?: string;
}

export function createToolTip(
    theme: ToolTipTheme,
    alignment: ToolTipAlignment,
    messages: string[],
    title?: string
): ToolTip {
    const toolTip: ToolTip = { theme: theme, alignment: alignment, messages: messages };
    if (title) {
        toolTip.title = title;
    }
    return toolTip;
}

/** Whether the tooltip has anything to show: a title or at least one message. */
export function hasToolTipContent(toolTip: ToolTip): boolean {
    return !!toolTip.title || toolTip.messages.length > 0;
}
