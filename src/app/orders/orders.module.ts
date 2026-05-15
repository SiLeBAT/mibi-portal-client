import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ORDERS_SLICE_NAME } from './orders.state';
import { ordersReducerMap, ordersEffects } from './orders.store';
import { OrderListViewComponent } from './presentation/order-list-view/order-list-view.component';
import { OrderListFilterInputComponent } from './presentation/order-list-filter-input/order-list-filter-input.component';
import { OrderListContainerComponent } from './container/order-list-container/order-list-container.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        StoreModule.forFeature(ORDERS_SLICE_NAME, ordersReducerMap),
        EffectsModule.forFeature(ordersEffects)
    ],
    declarations: [
        OrderListViewComponent,
        OrderListFilterInputComponent,
        OrderListContainerComponent
    ],
    exports: [
        OrderListContainerComponent
    ]
})
export class OrdersModule { }
