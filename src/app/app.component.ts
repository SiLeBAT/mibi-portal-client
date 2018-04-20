import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { User } from './models/user.model';
import { environment } from './../environments/environment';
import { UploadService } from './services/upload.service';
import { ValidateService } from './services/validate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private isActive = false;
  currentUser;
  appName: string = environment.appName;
  supportContact: string = environment.supportContact;

  constructor(public authService: AuthService,
    public uploadService: UploadService,
    public validateService: ValidateService) {}

  ngOnInit() {}

  getCurrentUserEmail() {
    if (this.authService.loggedIn()) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      return currentUser.email;
    }
  }

  getUserInstitution() {
    if (this.authService.loggedIn()) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      let name = currentUser.institution.name1;
      if (currentUser.institution.name2) {
        name = name + ', ' + currentUser.institution.name2;
      }
      return name;
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
