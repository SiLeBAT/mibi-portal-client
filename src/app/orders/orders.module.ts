import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { GridModule } from '../grid/grid.module';
import { ORDERS_SLICE_NAME } from './orders.state';
import { ordersReducer, ordersEffects } from './orders.store';
import { OrderListViewComponent } from './presentation/order-list-view/order-list-view.component';
import { OrderListFilterInputComponent } from './presentation/order-list-filter-input/order-list-filter-input.component';
import { OrderListFilterSelectComponent } from './presentation/order-list-filter-select/order-list-filter-select.component';
import { OrderListContainerComponent } from './container/order-list-container/order-list-container.component';
import { createOrderPaginatorIntl } from './presentation/order-list-paginator/order-list-paginator.intl';
import { OrderResultsContainerComponent } from './order-results/order-results-view/order-results-container.component';
import { OrderResultsViewComponent } from './order-results/order-results-view/order-results-view.component';
import { ToggleBarHeightDirective } from './order-results/order-results-view/toggle-bar-height.directive';
import { NoOrderGuard } from './services/no-order-guard.service';
import { ordersPathsSegments } from './orders.paths';
import { AnimationsRouteData } from '../shared/animations/animations.model';

const disabledTransitionAnimationData: AnimationsRouteData = {
    transitionAnimation: 'disabled'
};

const routes: Routes = [
    {
        path: ordersPathsSegments.orders + '/' + ordersPathsSegments.results + '/:orderId',
        component: OrderResultsContainerComponent,
        canActivate: [NoOrderGuard],
        data: { ...disabledTransitionAnimationData }
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        GridModule,
        RouterModule.forChild(routes),
        StoreModule.forFeature(ORDERS_SLICE_NAME, ordersReducer),
        EffectsModule.forFeature(ordersEffects)
    ],
    declarations: [
        OrderListViewComponent,
        OrderListFilterInputComponent,
        OrderListFilterSelectComponent,
        OrderListContainerComponent,
        OrderResultsContainerComponent,
        OrderResultsViewComponent,
        ToggleBarHeightDirective
    ],
    providers: [
        { provide: MatPaginatorIntl, useFactory: createOrderPaginatorIntl }
    ],
    exports: [
        OrderListContainerComponent,
        OrderResultsContainerComponent
    ]
})
export class OrdersModule { }
