import {Component, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MessageComponent} from "../../util/dialog/message/message.component";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerform: FormGroup;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router, private dialog: MatDialog) {

    this.registerform = this.fb.group({

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

    this.registerform.controls['username'].setValue("");
    this.registerform.controls['password'].setValue("");
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const { username, password } = this.registerform.value;

    this.authService.register(username, password).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;

        const dialogRef = this.dialog.open(MessageComponent, {
            width: '500px',
            data: {
              heading: "Signup successful",
              message: "You have successfully signed up"
            }
        });

        dialogRef.afterClosed().subscribe(result => {
          // Redirect the user to the login page
          this.router.navigateByUrl('login');
        });
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigateByUrl("login");
  }
}
