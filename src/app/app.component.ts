import { Component } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private isActive = false;

  constructor(private authService: AuthService) {}

  getCurrentUser() {
    if (this.authService.loggedIn()) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      return currentUser.email;
    }

  }

  activateSidebar() {
    this.isActive = true;
  }
  deactivateSidebar() {
    this.isActive = false;
  }

  isSidebarActive() {
    return this.isActive;
  }

  getDisplayMode() {
    let displayMode;
    if (this.isActive) {
      displayMode = 'block';
    } else {
      displayMode = 'none';
    }

    return displayMode;
  }

  onLogout() {
    this.deactivateSidebar();
    this.authService.logout();
  }

}
