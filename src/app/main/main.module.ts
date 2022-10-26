import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import { mainEffects } from './main.store';
import { NavBarLayoutComponent } from './nav-bar/components/nav-bar-layout.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavBarAvatarViewComponent } from './nav-bar/components/tabs/avatar-view.component';
import { NavBarLoginViewComponent } from './nav-bar/components/tabs/login-view.component';
import { NavBarTabsViewComponent } from './nav-bar/components/tabs/tabs-view.component';
import { NavBarTitleViewComponent } from './nav-bar/components/tabs/title-view.component';

@NgModule({
    imports: [
        CommonModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        SharedModule,
        RouterModule.forChild([]),
        EffectsModule.forFeature(mainEffects)
    ],
    declarations: [
        NavBarTitleViewComponent,
        NavBarTabsViewComponent,
        NavBarLoginViewComponent,
        NavBarAvatarViewComponent,
        NavBarLayoutComponent,
        NavBarComponent
    ],
    exports: [
        NavBarComponent
    ],
    schemas: []
})
export class MainModule { }
