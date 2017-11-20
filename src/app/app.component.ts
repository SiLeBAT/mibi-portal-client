import { Component } from '@angular/core';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Epi-Lab';

  private isActive = false;

  constructor(private authService: AuthService) {}

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

  onUpload() {
    console.log('Upload clicked');
  }

}
