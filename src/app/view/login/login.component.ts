import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MessageComponent} from "../../util/dialog/message/message.component";
import {User} from "../../entity/user";
import {UserComponent} from "../modules/user/user.component";
import {Userstatus} from "../../entity/userstatus";
import {UserService} from "../../service/userservice";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {


  loginform: FormGroup;
  users: Array<User> = [];
  hide = true;

  constructor(private us: UserService, private fb: FormBuilder, private router: Router, private dialog: MatDialog) {



    this.loginform = this.fb.group({

      "username": new FormControl("", [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(7)
        ]
      ),

      "password": new FormControl("", [
        Validators.required,
        Validators.minLength(4)
      ])

    });

    this.loginform.controls['username'].setValue("");
    this.loginform.controls['password'].setValue("");


  }


  authenticate(): void {

    const enteredUsername = this.loginform.controls['username'].value;
    const enteredPassword = this.loginform.controls['password'].value;

    if (this.loginform.controls["username"].value == "admin" && this.loginform.controls["password"].value == "1234")
      this.router.navigateByUrl("main/home");


    else {
      const dialogRef = this.dialog.open(MessageComponent, {
        width: '500px',
        data: {
          heading: "Invalid Login Details",
          message: "Username/Password Empty or Inavlid. Check for Username Length"
        }
      });


      dialogRef.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });

      this.router.navigateByUrl("login");
    }
  }


  signup(): void {

    const dialogRef = this.dialog.open(MessageComponent, {
      width: '500px',
      data: {heading: "Sign Up Not Available", message: "Public Registration Not Allowed. Please Contact System Admin"}
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) {
        return;
      }
    });

  }


}

