import { Injectable } from '@angular/core';
import {
    OrderListFilter,
    emptyOrderListFilter,
    isEmptyOrderListFilter,
    parseOrderListFilter
} from '../model/order-list-filter.model';

/**
 * Keeps the order list filter while the user leaves the list (e.g. to look at
 * an order's results) and comes back. sessionStorage is used on purpose: the
 * filter stays active for the rest of the browser session, a new session starts
 * with an unfiltered list.
 */
@Injectable({
    providedIn: 'root'
})
export class OrderListFilterStorageService {
    private static readonly STORAGE_KEY = 'orderListFilter';

    load(): OrderListFilter {
        try {
            const stored = sessionStorage.getItem(OrderListFilterStorageService.STORAGE_KEY);
            return stored ? parseOrderListFilter(JSON.parse(stored)) : emptyOrderListFilter();
        } catch {
            // Unavailable (e.g. storage blocked by the browser) or unreadable
            // storage must never keep the order list from being displayed.
            return emptyOrderListFilter();
        }
    }

    save(filter: OrderListFilter): void {
        if (isEmptyOrderListFilter(filter)) {
            this.clear();
            return;
        }
        try {
            sessionStorage.setItem(
                OrderListFilterStorageService.STORAGE_KEY,
                JSON.stringify(filter)
            );
        } catch {
            // Losing the filter is preferable to breaking the list.
        }
    }

    clear(): void {
        try {
            sessionStorage.removeItem(OrderListFilterStorageService.STORAGE_KEY);
        } catch {
            // Nothing to do; see save().
        }
    }
}
