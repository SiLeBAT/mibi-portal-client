import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => Promise<boolean>;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

  async canDeactivate(component: CanComponentDeactivate) {
    try {
      await component.canDeactivate();
      return true
    } catch (err) {
      return false;
    }
  }
}
