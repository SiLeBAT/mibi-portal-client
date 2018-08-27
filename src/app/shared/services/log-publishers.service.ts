import { Injectable } from '@angular/core';
import { LogPublisher, LogConsolePublisher } from './log-publishers';

@Injectable({
    providedIn: 'root'
})
export class LogPublishersService {

    publishers: LogPublisher[] = [];

    constructor() {
        this.buildPublishers();
    }

    buildPublishers(): void {
        this.publishers.push(new LogConsolePublisher());
    }
}
