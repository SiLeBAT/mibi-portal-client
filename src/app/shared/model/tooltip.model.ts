export const TOOLTIP_CLASS_HOOK = 'tooltipster-text';

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

export interface ToolTipOptions {
    repositionOnScroll: boolean;
    animation: any;
    delay: number;
    theme: string;
    touchDevices: boolean;
    trigger: string;
    contentAsHTML: boolean;
    content: string;
    side: any;
    multiple: boolean;
}
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

    getOptions(commentList: string[]) {
        return {
            repositionOnScroll: true,
            animation: 'grow', // fade
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
    alignmemt: ToolTipAlignment) {
    return new DefaultToolTip(theme, alignmemt);
}
