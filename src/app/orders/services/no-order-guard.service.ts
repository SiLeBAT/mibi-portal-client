import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { OrdersMainSlice } from '../orders.state';
import { selectOrderById } from '../state/order-list.selectors';
import { SamplesLinkProviderService } from '../../samples/link-provider.service';

@Injectable({
    providedIn: 'root'
})
export class NoOrderGuard {

    constructor(
        private store$: Store<OrdersMainSlice>,
        private router: Router,
        private samplesLinks: SamplesLinkProviderService
    ) {}

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        const orderId = route.paramMap.get('orderId');
        if (!orderId) {
            return this.router.parseUrl(this.samplesLinks.upload);
        }
        const order = await firstValueFrom(this.store$.pipe(select(selectOrderById(orderId))));
        return order ? true : this.router.parseUrl(this.samplesLinks.upload);
    }
}
