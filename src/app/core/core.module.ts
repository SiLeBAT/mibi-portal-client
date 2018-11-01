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
import { PageHeaderComponent } from './presentation/page-header/page-header.component';
import { PageFooterComponent } from './presentation/page-footer/page-footer.component';
import { StoreModule } from '@ngrx/store';
import { reducer, STATE_SLICE_NAME } from './state/core.reducer';
import { PageBodyContainerComponent } from './container/page-body-container/page-body-container.component';
import { JasperoConfirmationsModule } from '@jaspero/ng-confirmations';
import { LastChangeDisplayComponent } from './presentation/last-change-display/last-change-display.component';
import { LastChangeDisplayContainerComponent } from './container/last-change-display-container/last-change-display-container.component';
import { MomentModule } from 'ngx-moment';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AppBarTopComponent } from './presentation/app-bar-top/app-bar-top.component';
import { AppBarTopContainerComponent } from './container/app-bar-top-container/app-bar-top-container.component';
import { ActionItemListContainerComponent } from './container/action-item-list-container/action-item-list-container.component';
import { ActionItemListComponent } from './presentation/action-item-list/action-item-list.component';
import { GenericActionItemComponent } from './presentation/generic-action-item/generic-action-item.component';
import { UploadActionItemComponent } from './presentation/upload-action-item/upload-action-item.component';
import { BannerComponent } from './presentation/banner/banner.component';
import { BannerContainerComponent } from './container/banner-container/banner-container.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule } from '@angular/material/divider';

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
        RouterModule.forChild([]),
        StoreModule.forFeature(STATE_SLICE_NAME, reducer),
        JasperoConfirmationsModule
    ],
    declarations: [
        GenericActionItemComponent,
        UploadActionItemComponent,
        AppBarTopContainerComponent,
        ActionItemListContainerComponent,
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
        PageHeaderComponent,
        PageFooterComponent,
        BannerComponent,
        BannerContainerComponent
    ],
    exports: [
        HomeComponent,
        NavBarContainerComponent,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        DefaultPageLayoutComponent,
        BannerContainerComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [GenericActionItemComponent, UploadActionItemComponent]
})
export class CoreModule { }
