import { Output, EventEmitter, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit, Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, takeWhile } from 'rxjs/operators';
import { UploadErrorType } from '../../model/upload.model';

/* eslint-disable @angular-eslint/directive-class-suffix */
@Directive()
export class UploadAbstractComponent implements OnDestroy, AfterViewInit {

    private _lastInvalids: { file: File; type: string }[] = [];
    maxFileSize = 524_288;

    @Output() invokeValidation = new EventEmitter<File>();
    @Output() errorHandler = new EventEmitter<string>();
    @Output() guard = new EventEmitter();
    @Input() trigger$: Observable<boolean>;
    private canUpload: boolean = false;
    private componentActive = true;
    @ViewChild('selector', { read: ElementRef }) selector: ElementRef;

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

    ngOnDestroy() {
        this.componentActive = false;
    }

    get lastInvalids(): { file: File; type: string }[] {
        return this._lastInvalids;
    }

    set lastInvalids(val: { file: File; type: string }[]) {
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
