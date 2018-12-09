import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/presentation/home/home.component';

const ROUTES: Routes = [
    { path: '', component: HomeComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(ROUTES, { anchorScrolling: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
