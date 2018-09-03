import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './presentation/nav-bar/nav-bar.component';
import { NavBarContainerComponent } from './container/nav-bar-container/nav-bar-container.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './presentation/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild([])
    ],
    declarations: [
        HomeComponent,
        NavBarComponent,
        NavBarContainerComponent
    ],
    exports: [
        HomeComponent,
        NavBarContainerComponent,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class CoreModule { }
