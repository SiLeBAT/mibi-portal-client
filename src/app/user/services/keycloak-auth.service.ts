import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogoutResponse, MeResponse } from '../model/auth.model';
import { TokenizedUser } from '../model/user.model';
import {
    userDestroyCurrentUserSOA,
    userUpdateCurrentUserSOA
} from '../state/user.actions';

@Injectable({ providedIn: 'root' })
export class KeycloakAuthService {

    private readonly currentUserSubject = new BehaviorSubject<MeResponse | null>(null);
    readonly currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private store$: Store) {}

    login(): void {
        this.navigateTo('/v2/auth/login');
    }

    protected navigateTo(url: string): void {
        window.location.href = url;
    }

    me(): Observable<MeResponse> {
        return this.http.get<MeResponse>('/v2/auth/me').pipe(
            tap(user => {
                this.currentUserSubject.next(user);
                this.store$.dispatch(userUpdateCurrentUserSOA({ user: toTokenizedUser(user) }));
            })
        );
    }

    logout(): Observable<void> {
        return this.http.post<LogoutResponse>('/v2/auth/logout', {}).pipe(
            tap(response => {
                this.currentUserSubject.next(null);
                this.store$.dispatch(userDestroyCurrentUserSOA());
                this.navigateTo(response.endSessionUrl);
            })
        ) as unknown as Observable<void>;
    }
}

function toTokenizedUser(me: MeResponse): TokenizedUser {
    return {
        email: me.email,
        firstName: me.preferred_username,
        lastName: '',
        instituteId: '',
        token: '',
        dataSaveAgreed: me.dataSaveAgreed,
        dataSaveViewed: me.dataSaveViewed
    };
}
