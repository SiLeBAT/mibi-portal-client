import { Component } from '@angular/core';
import { dataProtectionLinks, dataProtectionOfficerIdCard } from '../../data-protection/data-protection.constants';
import { DatenschutzerklaerungViewModel } from '../datenschutzerklaerung/datenschutzerklaerung.component';

@Component({
    selector: 'mibi-datenschutzerklaerung-view',
    templateUrl: './datenschutzerklaerung-view.component.html'
})
export class DatenschutzerklaerungViewComponent {
    get datenschutzerklaerungViewModel(): DatenschutzerklaerungViewModel {
        return {
            dataProtectionOfficerIdCard: dataProtectionOfficerIdCard,
            dsGvoLink: dataProtectionLinks.dsGvoLink
        };
    }
}
