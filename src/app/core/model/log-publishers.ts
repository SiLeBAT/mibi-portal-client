
import { LogEntry } from '../services/log.service';
import { Observable, of } from 'rxjs';

export abstract class LogPublisher {
    location: string;

    abstract log(record: LogEntry): Observable<boolean>;
    abstract clear(): Observable<boolean>;
}

export class LogConsolePublisher extends LogPublisher {

    log(record: LogEntry) {
        // eslint-disable-next-line no-console
        console.log(record.buildLogString());
        return of(true);
    }

    clear() {
        // eslint-disable-next-line no-console
        console.clear();
        return of(true);
    }
}
