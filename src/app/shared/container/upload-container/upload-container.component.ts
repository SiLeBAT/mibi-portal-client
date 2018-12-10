import { Component, Output, EventEmitter, OnInit, OnDestroy, ContentChild, AfterContentInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromCore from '../../../core/state/core.reducer';
import * as fromSample from '../../../samples/state/samples.reducer';
import * as coreActions from '../../../core/state/core.actions';
import { takeWhile, tap } from 'rxjs/operators';
import { UserActionType, ColorType } from '../../model/user-action.model';
import { GenericActionItemComponent } from '../../../core/presentation/generic-action-item/generic-action-item.component';
import { Observable, Subject } from 'rxjs';
import { UploadAbstractComponent } from '../../presentation/upload/upload.abstract';
import { UploadErrorType } from '../../model/upload.model';

@Component({
    selector: 'mibi-upload-container',
    template: '<ng-content></ng-content>'
})
export class UploadContainerComponent implements OnInit, OnDestroy, AfterContentInit {

    @Output() onFileUpload = new EventEmitter();
    @ContentChild('uploadChild') uploadChild: UploadAbstractComponent;
    private myTrigger: Subject<boolean> = new Subject();
    trigger$: Observable<boolean> = this.myTrigger.asObservable();
    private componentActive = true;
    private hasEntries = false;
    private isGuardActive = true;
    constructor(
        private store: Store<fromCore.State>) { }

    ngOnInit() {
        this.store.pipe(select(fromSample.hasEntries),
            takeWhile(() => this.componentActive),
            tap(
                hasEntries => this.hasEntries = hasEntries
            )).subscribe();

    }

    ngAfterContentInit(): void {
        if (this.uploadChild) {
            this.uploadChild.trigger$ = this.trigger$;
            this.uploadChild.guard.asObservable().subscribe(
                e => {
                    this.guard(e);
                }
            );
            this.uploadChild.invokeValidation.asObservable().subscribe(
                (file: File) => {
                    this.invokeValidation(file);
                }
            );
            this.uploadChild.errorHandler.asObservable().subscribe(
                (error: UploadErrorType) => {
                    this.onError(error);
                }
            );

        }
    }

    onError(error: UploadErrorType) {
        switch (error) {
            case UploadErrorType.SIZE:
                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'wrongUploadFilesize' }));
                break;
            case UploadErrorType.TYPE:
                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'wrongUploadDatatype' }));
                break;
            default:
                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'uploadFailure' }));
        }
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    invokeValidation(file: File) {
        this.onFileUpload.emit(file);
    }

    guard(event: any) {
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
            this.store.dispatch(new coreActions.DisplayDialog({
                message: `Wenn Sie die Tabelle schließen, gehen Ihre Änderungen verloren. Wollen Sie das?`,
                title: 'Schließen',
                mainAction: {
                    type: UserActionType.CUSTOM,
                    label: 'Ok',
                    onExecute: () => {
                        this.isGuardActive = false;
                        this.myTrigger.next(!this.isGuardActive);
                    },
                    component: GenericActionItemComponent,
                    icon: '',
                    color: ColorType.PRIMARY,
                    focused: true
                },
                auxilliaryAction: {
                    type: UserActionType.CUSTOM,
                    label: 'Abbrechen',
                    onExecute: () => {
                    },
                    component: GenericActionItemComponent,
                    icon: '',
                    color: ColorType.PRIMARY
                }
            }));
        }

    }

}
