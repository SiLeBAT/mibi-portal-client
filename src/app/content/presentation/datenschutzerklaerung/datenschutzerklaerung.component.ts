import { Component, Input } from '@angular/core';
import { PersonellIdCard } from '../../personnel/personnel.model';

export interface DatenschutzerklaerungViewModel {
    dataProtectionOfficerIdCard: PersonellIdCard;
    dsGvoLink: string;
}

@Component({
    selector: 'mibi-datenschutzerklaerung',
    templateUrl: './datenschutzerklaerung.component.html',
    styleUrls: ['./datenschutzerklaerung.component.scss']
})
export class DatenschutzerklaerungComponent {
    @Input() model: DatenschutzerklaerungViewModel;

    get dataProtectionOfficerIdCard(): PersonellIdCard {
        return this.model.dataProtectionOfficerIdCard;
    }

    get dsGvoLink(): string {
        return this.model.dsGvoLink;
    }
}
