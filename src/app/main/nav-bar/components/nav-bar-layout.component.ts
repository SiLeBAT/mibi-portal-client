import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'mibi-nav-bar-layout',
    templateUrl: './nav-bar-layout.component.html',
    styleUrls: ['./nav-bar-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarLayoutComponent { }
