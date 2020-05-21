import {
    Component,
    Input, Output, EventEmitter
} from '@angular/core';
import { Banner } from '../../model/alert.model';

@Component({
    selector: 'mibi-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent {

    @Input() banner: Banner;
    @Output() mainAction = new EventEmitter();
    @Output() auxilliaryAction = new EventEmitter();

    onMainAction() {
        this.mainAction.emit();
    }

    onAuxAction() {
        this.auxilliaryAction.emit();
    }
}
