import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AlertService {
  private subject = new Subject<any>();
  private keepAfterNavigationChange = false;

  constructor(private router: Router) {
    // clear alert message on route change

  console.log('router.events: ', router.events);

    router.events
    .filter(event => event instanceof NavigationStart)
    .subscribe((event) => {
      if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
      } else {
          // clear alert
          this.subject.next();
      }
    });
  }

  success(message: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({
      type: 'success',
      text: message
    });
  }

  error(message: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({
      type: 'error',
      text: message
    });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

}
