import { Component, Input } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import {
    ToolTip,
    ToolTipTheme,
    createToolTip
} from '../../../shared/tooltip/tooltip.model';

@Component({
    standalone: false,
    selector: 'mibi-last-change-display',
    templateUrl: './last-change-display.component.html',
    styleUrls: ['./last-change-display.component.scss']
})
export class LastChangeDisplayComponent {
    @Input() lastChange$!: Observable<moment.Moment>;
    @Input() serverVersion!: string;
    @Input() clientVersion!: string;

    /**
     * The versions behind the "last change" line, shown on hover. Read from the
     * template on every change detection pass; the tooltip directive compares
     * the list by value, so an unchanged one costs nothing.
     */
    get versionToolTips(): ToolTip[] {
        const messages: string[] = [];
        if (this.serverVersion) {
            messages.push('server version@' + this.serverVersion);
        }
        if (this.clientVersion) {
            messages.push('client version@' + this.clientVersion);
        }
        return [createToolTip(ToolTipTheme.INFO, 'top', messages)];
    }
}
