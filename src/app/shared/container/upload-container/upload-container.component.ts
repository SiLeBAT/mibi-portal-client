import { Component, Output, EventEmitter, OnInit, OnDestroy, ContentChild, AfterContentInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap } from 'rxjs/operators';
import { UserActionType, ColorType } from '../../model/user-action.model';
import { Observable, Subject } from 'rxjs';
import { UploadAbstractComponent } from '../../presentation/upload/upload.abstract';
import { UploadErrorType } from '../../model/upload.model';
import { ClientError } from '../../../core/model/client-error';
import { SamplesMainSlice } from '../../../samples/samples.state';
import { selectHasEntries } from '../../../samples/state/samples.selectors';
import { showBannerSOA, showDialogMSA, hideBannerSOA } from '../../../core/state/core.actions';

@Component({
    selector: 'mibi-upload-container',
    template: '<ng-content></ng-content>'
})
export class UploadContainerComponent implements OnInit, OnDestroy, AfterContentInit {

    @Output() uploadFile = new EventEmitter<File>();
    @ContentChild('uploadChild') uploadChild: UploadAbstractComponent;
    private myTrigger: Subject<boolean> = new Subject();
    trigger$: Observable<boolean> = this.myTrigger.asObservable();
    private componentActive = true;
    private hasEntries = false;
    private isGuardActive = true;
    constructor(private store$: Store<SamplesMainSlice>) { }

    ngOnInit() {
        this.store$.pipe(select(selectHasEntries),
            takeWhile(() => this.componentActive),
            tap(
                entries => this.hasEntries = entries
            )).subscribe();

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
                (error: UploadErrorType) => {
                    this.onError(error);
                },
                (error) => {
                    throw new ClientError(`Can't invoke error handler. error=${error}`);
                }
            );

        }
    }

    onError(error: UploadErrorType) {
        switch (error) {
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
        if (!this.hasEntries) {
            this.isGuardActive = false;
            this.myTrigger.next(!this.isGuardActive);
            return;
        }
        if (this.hasEntries) {
            this.store$.dispatch(showDialogMSA({content: {
                message: `Wenn Sie die Tabelle schließen, gehen Ihre Änderungen verloren. Wollen Sie das?`,
                title: 'Schließen',
                mainAction: {
                    type: UserActionType.CUSTOM,
                    label: 'Ok',
                    onExecute: () => {
                        this.isGuardActive = false;
                        this.myTrigger.next(!this.isGuardActive);
                    },
                    icon: '',
                    color: ColorType.PRIMARY,
                    focused: true
                },
                auxilliaryAction: {
                    type: UserActionType.CUSTOM,
                    label: 'Abbrechen',
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    onExecute: () => {},
                    icon: '',
                    color: ColorType.PRIMARY
                }
            }}));
        }

    }
}
