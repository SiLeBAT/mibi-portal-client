import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ORDERS_SLICE_NAME } from './orders.state';
import { ordersReducerMap, ordersEffects } from './orders.store';

@NgModule({
    imports: [
        CommonModule,
        StoreModule.forFeature(ORDERS_SLICE_NAME, ordersReducerMap),
        EffectsModule.forFeature(ordersEffects)
    ]
})
export class OrdersModule { }
