import {
    Output, EventEmitter, Input, OnInit, ViewChild, ElementRef, OnDestroy, AfterContentInit, AfterViewInit
} from '@angular/core';
import { Observable } from 'rxjs';
import { tap, takeWhile } from 'rxjs/operators';
import { UploadErrorType } from '../../model/upload.model';

export class UploadAbstractComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

    private _lastInvalids: any[] = [];
    maxFileSize = 2097152;

    @Output() invokeValidation = new EventEmitter();
    @Output() errorHandler = new EventEmitter();
    @Output() guard = new EventEmitter();
    @Input() trigger$: Observable<boolean>;
    private canUpload: boolean = false;
    private componentActive = true;
    @ViewChild('selector', { read: ElementRef, static: false }) selector: ElementRef;

    constructor() { }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.trigger$.pipe(
            takeWhile(() => this.componentActive),
            tap(trigger => {
                if (trigger) {
                    this.canUpload = trigger;
                    if (trigger) {
                        this.selector.nativeElement.children[1].children[0].click();
                    }
                }
            })
        ).subscribe();
    }

    ngAfterContentInit(): void {

    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    get lastInvalids(): any[] {
        return this._lastInvalids;
    }

    set lastInvalids(val: any[]) {
        this._lastInvalids = val;
        if (val && val[0]) {
            this.errorHandler.emit(val[0].type);

        } else {
            this.errorHandler.emit(UploadErrorType.CLEAR);
        }
    }

    onFileChange(file: File) {
        this.invokeValidation.emit(file);
    }

    onClick(e: Event) {
        // if (e.isTrusted) {
        //     return;
        // }
        if (!e.isTrusted) { // Not sure why ngf sends off 2 events, but the untrusted one needs to be captured
            this.guard.emit({ native: this.selector.nativeElement.children[0].children[0], canUpload: this.canUpload });
        }
        if (this.canUpload) {
            this.canUpload = false;
            return;
        }
        e.preventDefault();

    }

}
