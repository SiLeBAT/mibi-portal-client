import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

import { AlertService } from '../services/alert.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private router: Router,
              private alertService: AlertService) { }

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).do(
      (event: HttpEvent<any>) => {
        // doing nothing
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.router.navigate(['/users/login']);
            this.alertService.error('Not authorized, please login');
          }
        }
      }
    );
  }
}
