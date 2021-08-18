import { Component } from '@angular/core';
import { dataProtectionOfficerIdCard } from '../../../content/data-protection/data-protection.constants';
import { DatenschutzHinweiseViewModel } from '../datenschutzhinweise/datenschutzhinweise.component';

@Component({
    selector: 'mibi-datenschutzhinweise-view',
    templateUrl: './datenschutzhinweise-view.component.html'
})
export class DatenSchutzHinweiseViewComponent {
    get datenschutzHinweiseViewModel(): DatenschutzHinweiseViewModel {
        return {
            dataProtectionOfficerIdCard: dataProtectionOfficerIdCard
        };
    }
}
