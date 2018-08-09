import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth/services/auth.service';
import { environment } from '../environments/environment';
import { UploadService } from './services/upload.service';
import { ValidateService } from './services/validate.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private isActive = false;
    currentUser: any;
    appName: string = environment.appName;
    supportContact: string = environment.supportContact;

    constructor(public authService: AuthService,
        public uploadService: UploadService,
        public validateService: ValidateService,
        private router: Router) { }

    ngOnInit() { }

    getCurrentUserEmail() {
        if (this.authService.loggedIn()) {
            const cu: string | null = localStorage.getItem('currentUser');
            if (!cu) {
                return '';
            }
            const currentUser = JSON.parse(cu);
            return currentUser.email;
        }
    }

    getUserInstitution() {
        if (this.authService.loggedIn()) {
            const cu: string | null = localStorage.getItem('currentUser');
            if (!cu) {
                return '';
            }
            const currentUser = JSON.parse(cu);
            let name = currentUser.institution.name1;
            if (currentUser.institution.name2) {
                name = name + ', ' + currentUser.institution.name2;
            }
            return name;
        }
    }

    onLogin() {
        this.router.navigate(['/users/login']).catch(err => {
            throw new Error('Navigation error: ' + err);
        });
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
        this.authService.logout();
    }

}
