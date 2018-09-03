
import { LogEntry } from '../services/log.service';
import { Observable, of } from 'rxjs';

export abstract class LogPublisher {
    location: string;

    abstract log(record: LogEntry): Observable<boolean>;
    abstract clear(): Observable<boolean>;
}

export class LogConsolePublisher extends LogPublisher {

    log(record: LogEntry) {
        // tslint:disable-next-line
        console.log(record.buildLogString());
        return Observable.create(of(true));
    }

    clear() {
        // tslint:disable-next-line
        console.clear();
        return Observable.create(of(true));
    }
}
