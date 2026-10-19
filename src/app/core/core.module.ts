import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './presentation/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { DefaultPageLayoutComponent } from './presentation/default-page-layout/default-page-layout.component';
import { PageBodyComponent } from './presentation/page-body/page-body.component';
import { PageFooterComponent } from './presentation/page-footer/page-footer.component';
import { StoreModule } from '@ngrx/store';
import { PageBodyContainerComponent } from './container/page-body-container/page-body-container.component';
import { LastChangeDisplayComponent } from './presentation/last-change-display/last-change-display.component';
import { LastChangeDisplayContainerComponent } from './container/last-change-display-container/last-change-display-container.component';
import { MomentModule } from 'ngx-moment';
import { BannerComponent } from './presentation/banner/banner.component';
import { BannerContainerComponent } from './container/banner-container/banner-container.component';
import { EffectsModule } from '@ngrx/effects';
import { FooterNavContainerComponent } from './container/footer-nav-container/footer-nav-container.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FooterNavComponent } from './presentation/footer-nav/footer-nav.component';
import {
    NewClientVersionDialogComponent
} from './presentation/new-client-version-dialog/new-client-version-dialog.component';
import { coreReducerMap, coreEffects } from './core.store';
import { CORE_SLICE_NAME } from './core.state';
import { MainModule } from '../main/main.module';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
    imports: [
        HttpClientModule,
        SharedModule,
        MainModule,
        MomentModule,
        MatTooltipModule,
        RouterModule.forChild([]),
        StoreModule.forFeature(CORE_SLICE_NAME, coreReducerMap),
        EffectsModule.forFeature(coreEffects),
        MarkdownModule.forChild()
    ],
    declarations: [
        FooterNavContainerComponent,
        LastChangeDisplayContainerComponent,
        LastChangeDisplayComponent,
        HomeComponent,
        DefaultPageLayoutComponent,
        PageBodyComponent,
        PageBodyContainerComponent,
        PageFooterComponent,
        BannerComponent,
        BannerContainerComponent,
        FooterNavComponent,
        NewClientVersionDialogComponent
    ],
    exports: [
        HomeComponent,
        HttpClientModule,
        DefaultPageLayoutComponent,
        BannerContainerComponent
    ]
})
export class CoreModule { }
