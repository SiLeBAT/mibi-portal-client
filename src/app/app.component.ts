import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Epi-Lab';

  private isActive = false;

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
}
