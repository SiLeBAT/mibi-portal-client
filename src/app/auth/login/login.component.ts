import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from './../services/auth.service';
import { AlertService } from './../services/alert.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private loginForm: FormGroup;
  loading = false;
  returnUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService) { }

  ngOnInit() {
    // reset login status
    this.authService.logout();

    // get return url from route parameters or default to '/'
    console.log('LoginComponent.ngOnInit route: ', this.route);

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.loginForm = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl(null, Validators.required),
    });
  }

  login() {
    this.loading = true;

    const user = new User(
      this.loginForm.value.email,
      this.loginForm.value.password
    );

    this.authService.login(user)
      .subscribe((data) => {
        console.log(data);
        this.router.navigate([this.returnUrl]);
      }, (error) => {
        console.error('login error: ', error);
        const message = error.title + ': ' + error.error.message;
        this.alertService.error(message);
        this.loading = false;
      });

    this.loginForm.reset();
  }

}



