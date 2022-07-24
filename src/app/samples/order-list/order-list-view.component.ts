import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { OrderListItem } from './order-list.model';

@Component({
    selector: 'mibi-order-list-view',
    templateUrl: './order-list-view.component.html',
    styleUrls: ['./order-list-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListViewComponent {
    @Input() items: OrderListItem[];

    get displayedColumns(): string[] {
        return ['date', 'name'];
    }
}
