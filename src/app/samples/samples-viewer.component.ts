import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderListOrder } from './order-list/order-list-view.component';

interface MockData {
    date: Date;
    name: string;
}

const mockData: MockData[] = [
    { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen alpha 1A' },
    { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen beta gamma omega delta v1.34' },
    { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen' },
    { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen' },
    { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen' },
    { date: new Date(628_021_800_000 + 100_000_000_000 * Math.random()), name: 'Probeneinsendebogen' }
];

const mockData$: BehaviorSubject<MockData[]> = new BehaviorSubject<MockData[]>([...mockData]);

@Component({
    template: `
        <mibi-order-list-view
            [orders]="orders$ | async"
            (orderClick)="onOrderClick($event)"
        ></mibi-order-list-view>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesViewerComponent {

    orders$: Observable<OrderListOrder[]> = mockData$.pipe(
        map(data => data.map((item, index) => ({...item, id: index})))
    );

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onOrderClick(_id: number): void {
    }
}
