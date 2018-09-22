import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { IToolTip, createToolTip, ToolTipTheme, TOOLTIP_CLASS_HOOK } from '../../model/tooltip.model';

@Component({
    selector: 'mibi-last-change-display',
    templateUrl: './last-change-display.component.html',
    styleUrls: ['./last-change-display.component.scss']
})
export class LastChangeDisplayComponent implements AfterViewInit {
    @Input() lastChange: string;
    @Input() serverVersion: string;
    @Input() clientVersion: string;
    @ViewChild('entry', { read: ElementRef }) entry: ElementRef;
    tooltipClassName = TOOLTIP_CLASS_HOOK;
    private toolTip: IToolTip;

    constructor() {
        this.toolTip = createToolTip(ToolTipTheme.INFO, 'top');
    }

    ngAfterViewInit(): void {
        const display: string[] = [];
        if (this.serverVersion) {
            display.push('server version@' + this.serverVersion);
        }
        if (this.clientVersion) {
            display.push('client version@' + this.clientVersion);
        }
        $(this.entry.nativeElement).tooltipster(this.toolTip.getOptions(
            display));
    }
}
