import _ from 'lodash';
import {
    ToolTip,
    ToolTipTheme,
    createToolTip
} from '../../../shared/tooltip/tooltip.model';
import { NrlTabInfo } from '../results-grid/nrl-results-catalog';

/**
 * The mouseover info of an NRL tab (ticket #885): the full NRL name in bold,
 * the pathogens below. The texts are editable in the dashboard and tooltips
 * render as HTML, so they are escaped here.
 */
export function nrlTabToolTips(info?: NrlTabInfo): ToolTip[] {
    if (!info) {
        return [];
    }
    const messages = info.pathogen ? [_.escape(info.pathogen)] : [];
    return [createToolTip(ToolTipTheme.NRL, 'bottom', messages, _.escape(info.fullName))];
}
