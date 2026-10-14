import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ContentChild, AfterContentInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { takeWhile } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { UploadAbstractComponent } from '../../presentation/upload/upload.abstract';
import { UploadErrorType } from '../../model/upload.model';
import { ClientError } from '../../../core/model/client-error';
import { showBannerSOA, hideBannerSOA } from '../../../core/state/core.actions';
import { DialogConfiguration } from '../../dialog/dialog.model';
import { dialogConfirmMTA, dialogOpenMTA } from '../../dialog/state/dialog.actions';
import { ofTarget } from '../../ngrx/multi-target-action';

const confirmDialogStrings = {
    title: 'Schließen',
    confirmButtonLabel: 'Ok',
    cancelButtonLabel: 'Abbrechen'
};

/**
 * Several upload containers can be on screen at once -- the action bar has one
 * and the upload page another -- and they all listen for the same confirm
 * action. Giving each instance its own target keeps one container's dialog from
 * opening another container's file chooser.
 */
let nextConfirmDialogTargetId = 0;

@Component({
    standalone: false,
    selector: 'mibi-upload-container',
    template: '<ng-content></ng-content>'
})
export class UploadContainerComponent implements OnInit, OnDestroy, AfterContentInit {

    /**
     * When set, the user is asked to confirm before the file chooser opens.
     * Whoever places this component decides whether anything would be lost;
     * this component only asks.
     */
    @Input() confirmMessage?: string;
    @Output() uploadFile = new EventEmitter<File>();
    @ContentChild('uploadChild') uploadChild?: UploadAbstractComponent;
    private myTrigger: Subject<boolean> = new Subject();
    trigger$: Observable<boolean> = this.myTrigger.asObservable();
    private componentActive = true;
    private isGuardActive = true;
    private readonly confirmDialogTarget =
        `Shared/UploadContainer/Confirm/${nextConfirmDialogTargetId++}`;

    constructor(
        private store$: Store,
        private actions$: Actions
    ) { }

    ngOnInit(): void {
        this.actions$.pipe(
            ofType(dialogConfirmMTA),
            ofTarget(this.confirmDialogTarget),
            takeWhile(() => this.componentActive)
        ).subscribe(() => this.openFileChooser());
    }

    ngAfterContentInit(): void {
        if (this.uploadChild) {
            this.uploadChild.trigger$ = this.trigger$;
            this.uploadChild.guard.asObservable().pipe(takeWhile(() => this.componentActive)).subscribe(
                e => {
                    this.guard(e);
                },
                (error) => {
                    throw new ClientError(`Can't determine guard. error=${error}`);
                }
            );
            this.uploadChild.invokeValidation.asObservable().pipe(takeWhile(() => this.componentActive)).subscribe(
                (file: File) => {
                    this.invokeValidation(file);
                },
                (error) => {
                    throw new ClientError(`Can't invoke validation. error=${error}`);
                }
            );
            this.uploadChild.errorHandler.asObservable().pipe(takeWhile(() => this.componentActive)).subscribe(
                (error) => {
                    this.onError(error);
                },
                (error) => {
                    throw new ClientError(`Can't invoke error handler. error=${error}`);
                }
            );

        }
    }

    // The upload component reports a raw string: either one of the known
    // UploadErrorType values or whatever the file-drop library rejected the
    // file for. Narrow it once so the cases below compare like with like.
    private toUploadErrorType(error: string): UploadErrorType | undefined {
        return (Object.values(UploadErrorType) as string[]).includes(error)
            ? error as UploadErrorType
            : undefined;
    }

    onError(error: string) {
        switch (this.toUploadErrorType(error)) {
            case UploadErrorType.SIZE:
                this.store$.dispatch(showBannerSOA({ predefined: 'wrongUploadFilesize' }));
                break;
            case UploadErrorType.TYPE:
                this.store$.dispatch(showBannerSOA({ predefined: 'wrongUploadDatatype' }));
                break;
            case UploadErrorType.CLEAR:
                this.store$.dispatch(hideBannerSOA());
                break;
            default:
                this.store$.dispatch(showBannerSOA({ predefined: 'uploadFailure' }));
        }
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    invokeValidation(file: File) {
        this.uploadFile.emit(file);
    }

    guard(_event: unknown) {
        if (!this.isGuardActive) {
            this.isGuardActive = true;
            return;
        }
        if (!this.confirmMessage) {
            this.openFileChooser();
            return;
        }
        this.store$.dispatch(dialogOpenMTA({
            target: this.confirmDialogTarget,
            configuration: this.createConfirmDialogConfiguration(this.confirmMessage)
        }));
    }

    // Cancelling needs no handler: the upload is simply abandoned.
    private createConfirmDialogConfiguration(message: string): DialogConfiguration {
        return {
            title: confirmDialogStrings.title,
            message: message,
            confirmButtonConfig: {
                label: confirmDialogStrings.confirmButtonLabel
            },
            cancelButtonConfig: {
                label: confirmDialogStrings.cancelButtonLabel
            },
            warnings: []
        };
    }

    private openFileChooser() {
        this.isGuardActive = false;
        this.myTrigger.next(!this.isGuardActive);
    }
}
