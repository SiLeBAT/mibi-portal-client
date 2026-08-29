import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    // The welcome text and the upload field now share a single page (the upload
    // view), so the landing route redirects there instead of a standalone home.
    { path: '', redirectTo: 'samples/upload', pathMatch: 'full' },
    // otherwise redirect to the landing page
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            anchorScrolling: 'enabled',
            initialNavigation: 'disabled'
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
