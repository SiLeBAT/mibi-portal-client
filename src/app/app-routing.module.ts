import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/presentation/home/home.component';
import { HomeResolver } from './core/services/home-resolver.service';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        resolve: { isAlternativeWelcomePage: HomeResolver}
    },
    // otherwise redirect to home
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
