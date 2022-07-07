import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavBarTab } from '../../nav-bar.model';

@Component({
    selector: 'mibi-nav-bar-login-view',
    templateUrl: './login-view.component.html',
    styleUrls: ['./login-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarLoginViewComponent {
    @Input() tab: NavBarTab;
}
