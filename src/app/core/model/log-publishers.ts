
import { LogEntry } from '../services/log.service';
import { Observable, of } from 'rxjs';

export abstract class LogPublisher {
    location!: string;

    abstract log(record: LogEntry): Observable<boolean>;
    abstract clear(): Observable<boolean>;
}

export class LogConsolePublisher extends LogPublisher {

    log(record: LogEntry) {
        console.log(record.buildLogString());
        return of(true);
    }

    clear() {
        console.clear();
        return of(true);
    }
}
