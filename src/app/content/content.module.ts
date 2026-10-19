import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { DatenschutzerklaerungComponent } from './presentation/datenschutzerklaerung/datenschutzerklaerung.component';
import { DatenschutzerklaerungViewComponent } from './presentation/datenschutzerklaerung-view/datenschutzerklaerung-view.component';
import { CONTENT_SLICE_NAME } from './content.state';
import { contentReducerMap } from './content.store';
import { StoreModule } from '@ngrx/store';
import { contentPathsSegments } from './content.paths';

const routes: Routes = [{
    path: contentPathsSegments.content,
    children: [
        { path: contentPathsSegments.dataProtection, component: DatenschutzerklaerungViewComponent }
    ]
}];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        StoreModule.forFeature(CONTENT_SLICE_NAME, contentReducerMap)
    ],
    declarations: [
        DatenschutzerklaerungComponent,
        DatenschutzerklaerungViewComponent
    ],
    exports: []
})
export class ContentModule { }
