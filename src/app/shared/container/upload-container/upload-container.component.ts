import { Component, Input, Output, EventEmitter, OnDestroy, ContentChild, AfterContentInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeWhile } from 'rxjs/operators';
import { UserActionType } from '../../model/user-action.model';
import { Observable, Subject } from 'rxjs';
import { UploadAbstractComponent } from '../../presentation/upload/upload.abstract';
import { UploadErrorType } from '../../model/upload.model';
import { ClientError } from '../../../core/model/client-error';
import { showBannerSOA, showDialogMSA, hideBannerSOA } from '../../../core/state/core.actions';

@Component({
    standalone: false,
    selector: 'mibi-upload-container',
    template: '<ng-content></ng-content>'
})
export class UploadContainerComponent implements OnDestroy, AfterContentInit {

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
    constructor(private store$: Store) { }

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
        this.store$.dispatch(showDialogMSA({content: {
            message: this.confirmMessage,
            title: 'Schließen',
            mainAction: {
                type: UserActionType.CUSTOM,
                label: 'Ok',
                onExecute: () => this.openFileChooser(),
                icon: '',
                focused: true
            },
            auxilliaryAction: {
                type: UserActionType.CUSTOM,
                label: 'Abbrechen',
                onExecute: () => { /* nothing to do: the upload is abandoned */ },
                icon: ''
            }
        }}));
    }

    private openFileChooser() {
        this.isGuardActive = false;
        this.myTrigger.next(!this.isGuardActive);
    }
}
