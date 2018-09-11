import { NgModule } from '@angular/core';
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
import { AlertComponent } from './presentation/alert/alert.component';
import { AlertContainerComponent } from './container/alert-container/alert-container.component';
import { StoreModule } from '@ngrx/store';
import { reducer, STATE_SLICE_NAME } from './state/core.reducer';
import { PageBodyContainerComponent } from './container/page-body-container/page-body-container.component';
import { SpinnerComponent } from './presentation/spinner/spinner.component';
import { JasperoConfirmationsModule } from '@jaspero/ng-confirmations';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild([]),
        StoreModule.forFeature(STATE_SLICE_NAME, reducer),
        JasperoConfirmationsModule
    ],
    declarations: [
        HomeComponent,
        NavBarComponent,
        NavBarContainerComponent,
        DefaultPageLayoutComponent,
        PageBodyComponent,
        PageBodyContainerComponent,
        PageHeaderComponent,
        PageFooterComponent,
        SpinnerComponent,
        AlertComponent,
        AlertContainerComponent
    ],
    exports: [
        HomeComponent,
        NavBarContainerComponent,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        DefaultPageLayoutComponent,
        SpinnerComponent,
        AlertContainerComponent
    ]
})
export class CoreModule { }
