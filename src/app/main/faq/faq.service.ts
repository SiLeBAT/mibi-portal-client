import { Injectable } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FaqEntryDTO, FaqResponseDTO, FaqSectionDTO } from '../../core/model/response.model';
import { Faq, FaqEntry, FaqSection } from './faq.model';

@Injectable({
    providedIn: 'root'
})
export class FaqService {

    constructor(private dataService: DataService) { }

    getFaq(): Observable<Faq> {
        return this.dataService.getFaq().pipe(
            map(dto => this.mapFaq(dto))
        );
    }

    private mapFaq(dto: FaqResponseDTO): Faq {
        return {
            topEntries: dto.topFaq.map(entry => this.mapEntry(entry)),
            sections: dto.sections.map(section => this.mapSection(section))
        };
    }

    private mapSection(dto: FaqSectionDTO): FaqSection {
        return {
            title: dto.title,
            urlFragment: dto.url,
            entries: dto.faq.map(entry => this.mapEntry(entry))
        };
    }

    private mapEntry(dto: FaqEntryDTO): FaqEntry {
        return {
            question: dto.q,
            answer: dto.a
        };
    }
}
