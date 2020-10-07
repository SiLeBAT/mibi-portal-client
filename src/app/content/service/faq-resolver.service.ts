import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import * as _ from 'lodash';
import { IFAQGroup } from '../presentation/faq-section/faq-section.component';

@Injectable({
    providedIn: 'root'
})
export class FAQResolver implements Resolve<IFAQGroup[]> {

    constructor(
        private dataService: DataService) { }

    async resolve(activatedRoute: ActivatedRouteSnapshot, sanp: RouterStateSnapshot): Promise<IFAQGroup[]> {
        return this.dataService.getFAQs().toPromise().then(
            data => {
                // tslint:disable-next-line
                return _.values((_.mapValues(data, (value, key) => {
                    const title = key === 'top' ? '' : key;
                    return {
                        faqs: value,
                        id: title.replace(/\s/g, ''),
                        title: title
                    };
                }))) as IFAQGroup[];
            }
        ).catch(
            () => {
                return [] as IFAQGroup[];
            }
        );
    }
}
