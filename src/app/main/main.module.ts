import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import { mainEffects } from './main.store';
import { NavBarLayoutComponent } from './nav-bar/components/nav-bar-layout.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavBarAvatarViewComponent } from './nav-bar/components/tabs/avatar-view.component';
import { NavBarLoginViewComponent } from './nav-bar/components/tabs/login-view.component';
import { NavBarTabsViewComponent } from './nav-bar/components/tabs/tabs-view.component';
import { NavBarTitleViewComponent } from './nav-bar/components/tabs/title-view.component';
import { mainPathsSegments } from './main.paths';
import { FaqComponent } from './faq/components/faq.component';
import { FaqResolverService } from './faq/faq-resolver.service';
import { FaqViewComponent } from './faq/components/faq-view.component';
import { FaqSectionViewComponent } from './faq/components/faq-section-view.component';

const routes: Routes = [{
    path: mainPathsSegments.faq, component: FaqComponent, resolve: { faq: FaqResolverService }
}];

@NgModule({
    imports: [
        CommonModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatExpansionModule,
        SharedModule,
        RouterModule.forChild(routes),
        EffectsModule.forFeature(mainEffects)
    ],
    declarations: [
        NavBarTitleViewComponent,
        NavBarTabsViewComponent,
        NavBarLoginViewComponent,
        NavBarAvatarViewComponent,
        NavBarLayoutComponent,
        NavBarComponent,
        FaqSectionViewComponent,
        FaqViewComponent,
        FaqComponent
    ],
    exports: [
        NavBarComponent
    ]
})
export class MainModule { }
