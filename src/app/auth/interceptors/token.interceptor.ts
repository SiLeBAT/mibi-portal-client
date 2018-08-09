import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class TokenInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {

        const token = this.getToken();

        if (token) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(req);
    }

    private getToken() {
        const cu: string | null = localStorage.getItem('currentUser');
        if (!cu) {
            return null;
        }
        const currentUser = JSON.parse(cu);
        let token;
        if (currentUser && currentUser.token) {
            token = currentUser.token;
        } else {
            token = null;
        }

        return token;
    }

}
