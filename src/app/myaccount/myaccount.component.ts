import { Institution } from './../models/institution.model';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.css']
})
export class MyaccountComponent implements OnInit {
  currentUser = this.authService.getCurrentUser();;

  constructor(private router: Router,
              private authService: AuthService) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  addUserData() {
    this.router.navigateByUrl('/userdata');
  }

  hasUserData() {
    if (this.currentUser.userdata.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  deleteUserData() {
    console.log('deleteUserData clicked');
  }

}
