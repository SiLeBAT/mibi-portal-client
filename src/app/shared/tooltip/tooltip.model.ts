/**
 * What a tooltip says and how it looks. Nothing here names the library that
 * renders it: the mapping onto tooltipster lives in `tooltip.service.ts`, so
 * callers describe tooltips and never reach for the library themselves.
 */

export enum ToolTipTheme {
    WARNING = 'warning',
    ERROR = 'error',
    INFO = 'info',
    TIP = 'tip'
}

export type ToolTipAlignment = 'bottom' | 'top' | 'left' | 'right';

export interface ToolTip {
    theme: ToolTipTheme;
    alignment: ToolTipAlignment;
    /** One bullet per entry. An empty list means there is nothing to show. */
    messages: string[];
}

export function createToolTip(
    theme: ToolTipTheme,
    alignment: ToolTipAlignment,
    messages: string[]
): ToolTip {
    return { theme: theme, alignment: alignment, messages: messages };
}
