import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrderListItem } from './order-list/order-list.model';

@Component({
    template: `
        <mibi-order-list-view [items]="items"></mibi-order-list-view>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesViewerComponent {
    get items(): OrderListItem[] {
        return [
            { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen alpha 1A' },
            { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen beta gamma omega delta v1.34' },
            { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen' },
            { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen' },
            { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen' },
            { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen' }
        ];
    }
}
