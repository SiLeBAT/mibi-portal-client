import 'tooltipster';

export enum ToolTipType {
    WARNING = 1,
    ERROR = 2,
    TIP = 3,
    INFO = 4
}

export enum ToolTipTheme {
    WARNING = 'tooltipster-warning',
    ERROR = 'tooltipster-error',
    INFO = 'tooltipster-info',
    TIP = 'tooltipster-tip'
}

export type ToolTipAlignment = 'bottom' | 'top' | 'left' | 'right';

export type ToolTipOptions = JQueryTooltipster.ITooltipsterOptions;

export interface ToolTip {
    theme: string;
    alignmemt: ToolTipAlignment;
    constructToolTipText(commentList: string[]): string;
    getOptions(commentList: string[]): ToolTipOptions;
}

class DefaultToolTip implements ToolTip {

    constructor(public theme: string,
        public alignmemt: 'bottom' | 'top' | 'left' | 'right') { }

    constructToolTipText(commentList: string[]): string {
        let tooltipText = '<ul>';
        for (const comment of commentList) {
            tooltipText += '<li>';
            tooltipText += comment;
            tooltipText += '</li>';
        }
        tooltipText += '</ul>';
        return tooltipText;
    }

    getOptions(commentList: string[]): ToolTipOptions {
        return {
            repositionOnScroll: true,
            animation: 'grow',
            delay: 0,
            theme: this.theme,
            touchDevices: false,
            trigger: 'hover',
            contentAsHTML: true,
            content: this.constructToolTipText(commentList),
            side: this.alignmemt,
            multiple: true
        };
    }
}

export function createToolTip(theme: ToolTipTheme,
    alignmemt: ToolTipAlignment): ToolTip {
    return new DefaultToolTip(theme, alignmemt);
}
