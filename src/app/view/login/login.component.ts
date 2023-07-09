import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MessageComponent} from "../../util/dialog/message/message.component";
import {User} from "../../entity/user";
import {UserComponent} from "../modules/user/user.component";
import {Userstatus} from "../../entity/userstatus";
import {UserService} from "../../service/userservice";
import {AuthService} from "../services/auth.service";
import {TokenStorageService} from "../services/token-storage.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  loginform: FormGroup;

  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, private fb: FormBuilder, private router: Router, private dialog: MatDialog) {

    this.loginform = this.fb.group({

      "username": new FormControl("", [
          Validators.required,
          Validators.minLength(4)
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

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
  }

  onSubmit(): void {
    const { username, password } = this.loginform.value;

    this.authService.login(username, password).subscribe({
      next: data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        console.log(this.roles);
        // Redirect users based on their roles
        if (this.roles.includes('ROLE_MANAGER')) {
          this.router.navigateByUrl('manager/home');
        } else if (this.roles.includes('ROLE_ADMIN')) {
          this.router.navigateByUrl('admin/home');
        } else if (this.roles.includes('ROLE_EXECUTIVE')) {
          this.router.navigateByUrl('executive/home');
        } else {
          // Handle other roles or scenarios
        }
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;

        const dialogRef = this.dialog.open(MessageComponent, {
          width: '500px',
          data: {
            heading: "Bad Credentials",
            message: "Invalid username/password"
          }
        });

        dialogRef.afterClosed().subscribe(async result => {
          if (!result) {
            return;
          }
        });

        this.router.navigateByUrl("login");
      }


    });
  }

  navigateToRegister(): void {
    this.router.navigateByUrl("register");
  }

  navigateToHome(): void{
    if (this.roles.includes('ROLE_MANAGER')) {
      this.router.navigateByUrl('manager/home');
    } else if (this.roles.includes('ROLE_ADMIN')) {
      this.router.navigateByUrl('admin/home');
    } else if (this.roles.includes('ROLE_EXECUTIVE')) {
      this.router.navigateByUrl('executive/home');
    } else {
      // Handle other roles or scenarios
    }
  }
  reloadPage(): void {
    window.location.reload();
  }






  /*loginform: FormGroup;
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

  }*/


}

