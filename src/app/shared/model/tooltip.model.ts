export const TOOLTIP_CLASS_HOOK = 'tooltipster-text';

export enum ToolTipTheme {
    WARNING = 'tooltipster-warning',
    ERROR = 'tooltipster-error',
    INFO = 'tooltipster-info',
    TIP = 'tooltipster-tip'
}

export type ToolTipAlignment = 'bottom' | 'top' | 'left';

export interface IToolTipOptions {
    repositionOnScroll: boolean;
    animation: any;
    delay: number;
    theme: string;
    touchDevices: boolean;
    trigger: string;
    contentAsHTML: boolean;
    content: string;
    side: any;
}
export interface IToolTip {
    theme: string;
    alignmemt: ToolTipAlignment;
    constructToolTipText(commentList: string[]): string;
    getOptions(commentList: string[]): IToolTipOptions;
}

class ToolTip implements IToolTip {

    constructor(public theme: string,
        public alignmemt: 'bottom' | 'top' | 'left') { }

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
            side: this.alignmemt
        };
    }
}

export function createToolTip(theme: ToolTipTheme,
    alignmemt: ToolTipAlignment) {
    return new ToolTip(theme, alignmemt);
}
