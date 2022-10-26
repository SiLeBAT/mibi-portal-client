import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavBarTab } from '../../nav-bar.model';

@Component({
    selector: 'mibi-nav-bar-title-view',
    templateUrl: './title-view.component.html',
    styleUrls: ['./title-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarTitleViewComponent {
    @Input() tab: NavBarTab;
}
