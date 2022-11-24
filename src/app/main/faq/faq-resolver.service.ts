import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { showBannerSOA } from '../../core/state/core.actions';
import { Faq } from './faq.model';
import { FaqService } from './faq.service';

@Injectable({
    providedIn: 'root'
})
export class FaqResolverService implements Resolve<Faq> {

    constructor(
        private faqService: FaqService,
        private store$: Store
    ) { }

    resolve(_activatedRoute: ActivatedRouteSnapshot, _snap: RouterStateSnapshot): Observable<Faq> {
        return this.faqService.getFaq().pipe(
            catchError(() => {
                this.store$.dispatch(showBannerSOA({ predefined: 'defaultError' }));
                return EMPTY;
            })
        );
    }
}
