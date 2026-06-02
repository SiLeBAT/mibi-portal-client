import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Faq, FaqSection } from '../../main/faq/faq.model';

interface StrapiFaqSection {
    id: number;
    title: string;
    url: string;
}

interface StrapiFaqEntry {
    id: number;
    question: string;
    answer: string;
    isTop: boolean;
    section: StrapiFaqSection | null;
}

interface StrapiFaqResponse {
    data: StrapiFaqEntry[];
}

@Injectable({
    providedIn: 'root'
})
export class StrapiService {

    private readonly CMS_API = environment.cmsApiUrl;

    constructor(private httpClient: HttpClient) {}

    getFaq(): Observable<Faq | null> {
        return this.httpClient
            .get<StrapiFaqResponse>(`${this.CMS_API}/faq-entries?populate=section&pagination[limit]=100&sort=id:asc`)
            .pipe(
                map(response => this.mapFaq(response.data)),
                catchError(() => of(null))
            );
    }

    private mapFaq(entries: StrapiFaqEntry[]): Faq | null {
        if (entries.length === 0) {
            return null;
        }

        const topEntries = entries
            .filter(e => e.isTop)
            .map(e => ({ question: e.question, answer: e.answer }));

        const sectionMap = new Map<number, FaqSection>();
        for (const entry of entries) {
            if (!entry.isTop && entry.section) {
                if (!sectionMap.has(entry.section.id)) {
                    sectionMap.set(entry.section.id, {
                        title: entry.section.title,
                        urlFragment: entry.section.url,
                        entries: []
                    });
                }
                sectionMap.get(entry.section.id)!.entries.push({
                    question: entry.question,
                    answer: entry.answer
                });
            }
        }

        return {
            topEntries: topEntries,
            sections: [...sectionMap.values()]
        };
    }
}
