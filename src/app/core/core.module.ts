import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './presentation/nav-bar/nav-bar.component';
import { NavBarContainerComponent } from './container/nav-bar-container/nav-bar-container.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './presentation/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DefaultPageLayoutComponent } from './presentation/default-page-layout/default-page-layout.component';
import { PageBodyComponent } from './presentation/page-body/page-body.component';
import { PageFooterComponent } from './presentation/page-footer/page-footer.component';
import { StoreModule } from '@ngrx/store';
import { PageBodyContainerComponent } from './container/page-body-container/page-body-container.component';
import { LastChangeDisplayComponent } from './presentation/last-change-display/last-change-display.component';
import { LastChangeDisplayContainerComponent } from './container/last-change-display-container/last-change-display-container.component';
import { MomentModule } from 'ngx-moment';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AppBarTopComponent } from './presentation/app-bar-top/app-bar-top.component';
import { AppBarTopContainerComponent } from './container/app-bar-top-container/app-bar-top-container.component';
import { ActionItemListComponent } from './presentation/action-item-list/action-item-list.component';
import { GenericActionItemComponent } from './presentation/generic-action-item/generic-action-item.component';
import { BannerComponent } from './presentation/banner/banner.component';
import { BannerContainerComponent } from './container/banner-container/banner-container.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule } from '@angular/material/divider';
import { CoreMainEffects } from './core.effects';
import { EffectsModule } from '@ngrx/effects';
import { AvatarComponent } from './presentation/avatar/avatar.component';
import { AvatarContainerComponent } from './container/avatar-container/avatar-container.component';
import { FooterNavContainerComponent } from './container/footer-nav-container/footer-nav-container.component';
import { MatDialogModule } from '@angular/material';
import { FooterNavComponent } from './presentation/footer-nav/footer-nav.component';
import { coreReducerMap, coreEffects } from './core.store';
import { CORE_SLICE_NAME } from './core.state';

@NgModule({
    imports: [
        MatButtonModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
        MatDividerModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        MomentModule,
        MatMenuModule,
        MatIconModule,
        MatToolbarModule,
        MatDialogModule,
        RouterModule.forChild([]),
        StoreModule.forFeature(CORE_SLICE_NAME, coreReducerMap),
        EffectsModule.forFeature(coreEffects)
    ],
    declarations: [
        FooterNavContainerComponent,
        AvatarComponent,
        AvatarContainerComponent,
        GenericActionItemComponent,
        AppBarTopContainerComponent,
        ActionItemListComponent,
        AppBarTopComponent,
        LastChangeDisplayContainerComponent,
        LastChangeDisplayComponent,
        HomeComponent,
        NavBarComponent,
        NavBarContainerComponent,
        DefaultPageLayoutComponent,
        PageBodyComponent,
        PageBodyContainerComponent,
        PageFooterComponent,
        BannerComponent,
        BannerContainerComponent,
        FooterNavComponent
    ],
    exports: [
        HomeComponent,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        DefaultPageLayoutComponent,
        BannerContainerComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [GenericActionItemComponent]
})
export class CoreModule { }
