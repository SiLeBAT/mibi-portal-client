import { Injectable } from '@angular/core';
import { LogPublisher } from '../model/log-publishers';
import { LogPublishersService } from './log-publishers.service';
import { ClientError } from '../model/client-error';

export enum LogLevel {
    ALL = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5,
    OFF = 6
}

export class LogEntry {
    entryDate: Date = new Date();
    message: string = '';
    level: LogLevel = LogLevel.DEBUG;
    extraInfo: any[] = [];
    logWithDate: boolean = true;

    buildLogString(): string {
        let ret: string = '';
        if (this.logWithDate) {
            ret = new Date().toString() + ' - ';
        }

        ret += 'Type: ' + LogLevel[this.level];

        ret += ' - Message: ' + this.message;

        if (this.extraInfo.length > 0) {
            ret += ' - Extra Info: ' + this.formatParams(this.extraInfo);
        }

        return ret;
    }

    private formatParams(params: any[]): string {
        let ret: string = params.join(',');
        if (params.some(p => typeof p === 'object')) {
            const retArry: string[] = [];
            for (const item of params) {
                if (item.message) {
                    // eslint-disable-next-line
                    retArry.push(item.message);
                } else {
                    retArry.push(JSON.stringify(item));
                }
                ret = retArry.join(', ');
            }
        }
        return ret;
    }
}

@Injectable({
    providedIn: 'root'
})
export class LogService {

    level: LogLevel = LogLevel.ALL;
    logWithDate: boolean = true;
    publishers: LogPublisher[];

    constructor(private publishersService: LogPublishersService) {
        this.publishers = this.publishersService.publishers;
    }

    log(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.ALL, optionalParams);
    }

    debug(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.DEBUG, optionalParams);
    }

    info(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.INFO, optionalParams);
    }

    warn(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.WARN, optionalParams);
    }

    error(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.ERROR, optionalParams);
    }

    fatal(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.FATAL, optionalParams);
    }

    clear() {
        for (const publisher of this.publishers) {
            publisher.clear();
        }
    }

    private shouldLog(level: LogLevel) {
        return this.level !== LogLevel.OFF && level >= this.level;
    }

    private writeToLog(msg: string, level: LogLevel, params: any[]) {
        if (this.shouldLog(level)) {
            const entry: LogEntry = new LogEntry();
            entry.message = msg;
            entry.level = level;
            entry.extraInfo = params;
            entry.logWithDate = this.logWithDate;

            for (const logger of this.publishers) {
                logger.log(entry).subscribe(_response => ({}), (error) => {
                    throw new ClientError(`Unable to log. error=${error}`);
                });
            }
        }
    }
}
