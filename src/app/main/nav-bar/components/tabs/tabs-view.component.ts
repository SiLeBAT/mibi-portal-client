import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavBarTab } from '../../nav-bar.model';

@Component({
    selector: 'mibi-nav-bar-tabs-view',
    templateUrl: './tabs-view.component.html',
    styleUrls: ['./tabs-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarTabsViewComponent {
    @Input() tabs: NavBarTab[];
}
