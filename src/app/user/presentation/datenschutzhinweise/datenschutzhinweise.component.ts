import { Component, Input } from '@angular/core';
import { PersonellIdCard } from '../../../content/personnel/personnel.model';

export interface DatenschutzHinweiseViewModel {
    dataProtectionOfficerIdCard: PersonellIdCard;
}

@Component({
    selector: 'mibi-datenschutzhinweise',
    templateUrl: './datenschutzhinweise.component.html',
    styleUrls: ['./datenschutzhinweise.component.scss']
})
export class DatenschutzHinweiseComponent {
    @Input() model: DatenschutzHinweiseViewModel;

    get dataProtectionOfficerIdCard(): PersonellIdCard {
        return this.model.dataProtectionOfficerIdCard;
    }
}
