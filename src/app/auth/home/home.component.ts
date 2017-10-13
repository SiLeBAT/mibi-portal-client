import { Component, OnInit } from '@angular/core';

import { User } from './../../models/user.model';
import { UserService } from './../services/user.service';
import { AlertService } from './../services/alert.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  users: User[] = [];

  constructor(private userService: UserService,
              private alertService: AlertService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  deleteUser(user: User) {
    let _id = user._id;
    this.userService.delete(_id)
    .subscribe((data) => {
      console.log('deleted user ' + _id, + ': ', data);
      this.alertService.success('User ' + user.firstName + ' ' + user.lastName + ' deleted', true);
      this.loadAllUsers();
    }, (error) => {
      console.error(error);
      this.alertService.error(error);
      this.loadAllUsers();
    });

  }

  private loadAllUsers() {
    this.userService.getAll()
    .subscribe((data) => {
      this.users = data.obj;
    });
  }
}
