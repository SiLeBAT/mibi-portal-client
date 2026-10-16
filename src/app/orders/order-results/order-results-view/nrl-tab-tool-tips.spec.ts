import { ToolTipTheme, createToolTip } from '../../../shared/tooltip/tooltip.model';
import { nrlTabToolTips } from './nrl-tab-tool-tips';

describe('nrlTabToolTips', () => {
    it('shows the full name as title and the pathogens below, under the tab', () => {
        expect(nrlTabToolTips({
            fullName: 'NRL für Antibiotikaresistenz',
            pathogen: 'Erreger: Enterokokken'
        })).toEqual([
            createToolTip(ToolTipTheme.NRL, 'bottom', ['Erreger: Enterokokken'], 'NRL für Antibiotikaresistenz')
        ]);
    });

    it('leaves out a missing text', () => {
        expect(nrlTabToolTips({ fullName: 'NRL für Salmonellen', pathogen: '' }))
            .toEqual([createToolTip(ToolTipTheme.NRL, 'bottom', [], 'NRL für Salmonellen')]);
        expect(nrlTabToolTips({ fullName: '', pathogen: 'Erreger: Salmonella' }))
            .toEqual([createToolTip(ToolTipTheme.NRL, 'bottom', ['Erreger: Salmonella'])]);
    });

    it('shows nothing for a tab without info', () => {
        expect(nrlTabToolTips()).toEqual([]);
    });

    it('escapes the texts, as they are editable in the dashboard', () => {
        expect(nrlTabToolTips({ fullName: '<b>A & B</b>', pathogen: '"x" <script>' })).toEqual([
            createToolTip(ToolTipTheme.NRL, 'bottom', ['&quot;x&quot; &lt;script&gt;'], '&lt;b&gt;A &amp; B&lt;/b&gt;')
        ]);
    });
});
